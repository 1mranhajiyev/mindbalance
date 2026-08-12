from django.utils import timezone
from datetime import datetime, timezone as dt_timezone
from rest_framework import viewsets, permissions, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
import uuid
from apps.users.assignments import get_assigned_patient_or_404, get_assigned_psychologists, is_assigned
from .models import TherapySession, Task, Goal, SessionWebRTCSignal
from .serializers import TherapySessionSerializer, TaskSerializer, GoalSerializer


class TherapySessionViewSet(viewsets.ModelViewSet):
    serializer_class = TherapySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return TherapySession.objects.filter(
                psychologist__user=user
            ).select_related('patient__user', 'psychologist__user')
        return TherapySession.objects.filter(
            patient__user=user
        ).select_related('patient__user', 'psychologist__user')

    def _ensure_session_access(self, session):
        user = self.request.user
        if user.role == 'patient' and session.patient.user_id != user.id:
            raise PermissionDenied('Bu seansa giriş icazəniz yoxdur.')
        if user.role == 'psychologist' and session.psychologist.user_id != user.id:
            raise PermissionDenied('Bu seansa giriş icazəniz yoxdur.')

    def perform_create(self, serializer):
        user = self.request.user
        room_id = str(uuid.uuid4())
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            if not patient_id:
                raise serializers.ValidationError({'patient_id': 'Pasiyent seçilməlidir.'})
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(
                patient=patient,
                psychologist=user.psychologist_profile,
                webrtc_room_id=room_id,
            )
        else:
            patient = user.patient_profile
            psychologist_id = self.request.data.get('psychologist_id')
            psychologists = get_assigned_psychologists(patient)
            if not psychologists.exists():
                raise serializers.ValidationError({'detail': 'Əvvəlcə psixoloq assign olunmalıdır.'})
            if psychologist_id:
                psychologist = psychologists.get(id=psychologist_id)
            else:
                psychologist = psychologists.first()
            serializer.save(
                patient=patient,
                psychologist=psychologist,
                webrtc_room_id=room_id,
            )

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        session = self.get_object()
        self._ensure_session_access(session)
        if session.status == 'completed':
            return Response({'detail': 'Seans artıq bitib.'}, status=status.HTTP_400_BAD_REQUEST)

        update_fields = []
        if not session.webrtc_room_id:
            session.webrtc_room_id = str(uuid.uuid4())
            update_fields.append('webrtc_room_id')

        was_empty = not session.patient_in_call and not session.psychologist_in_call
        if was_empty:
            session.webrtc_signals.all().delete()

        if request.user.role == 'patient':
            session.patient_in_call = True
            update_fields.append('patient_in_call')
        else:
            session.psychologist_in_call = True
            update_fields.append('psychologist_in_call')

        if session.patient_in_call and session.psychologist_in_call:
            session.call_had_both = True
            update_fields.append('call_had_both')
            if not session.started_at:
                session.started_at = timezone.now()
                update_fields.append('started_at')

        session.save(update_fields=list(dict.fromkeys(update_fields)))
        session.refresh_from_db()
        return Response(TherapySessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        session = self.get_object()
        self._ensure_session_access(session)

        update_fields = []
        if request.user.role == 'patient':
            session.patient_in_call = False
            update_fields.append('patient_in_call')
        else:
            session.psychologist_in_call = False
            update_fields.append('psychologist_in_call')

        room_empty = not session.patient_in_call and not session.psychologist_in_call

        if room_empty:
            session.webrtc_signals.all().delete()
            if session.call_had_both:
                session.status = 'completed'
                session.ended_at = timezone.now()
                update_fields.extend(['status', 'ended_at'])
            elif session.status != 'completed':
                session.status = 'scheduled'
                session.started_at = None
                session.ended_at = None
                update_fields.extend(['status', 'started_at', 'ended_at'])
            session.call_had_both = False
            update_fields.append('call_had_both')

        session.save(update_fields=list(dict.fromkeys(update_fields)))
        session.refresh_from_db()
        return Response(TherapySessionSerializer(session).data)

    @action(detail=True, methods=['get', 'post'], url_path='signals')
    def signals(self, request, pk=None):
        session = self.get_object()
        self._ensure_session_access(session)

        if request.method == 'POST':
            signal_data = request.data.get('data')
            if signal_data is None:
                return Response({'detail': 'Signal məlumatı tələb olunur.'}, status=status.HTTP_400_BAD_REQUEST)
            SessionWebRTCSignal.objects.create(
                session=session,
                from_role=request.user.role,
                data=signal_data,
            )
            return Response({'ok': True})

        since = float(request.query_params.get('since', 0))
        opponent = 'psychologist' if request.user.role == 'patient' else 'patient'
        since_dt = datetime.fromtimestamp(since, tz=dt_timezone.utc)
        signals = session.webrtc_signals.filter(
            from_role=opponent,
            created_at__gt=since_dt,
        ).order_by('created_at')

        return Response([
            {
                'from': signal.from_role,
                'data': signal.data,
                'ts': signal.created_at.timestamp(),
            }
            for signal in signals
        ])


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            from apps.users.assignments import get_assigned_patients
            assigned = get_assigned_patients(user.psychologist_profile)
            return Task.objects.filter(patient__in=assigned).select_related('patient__user')
        return Task.objects.filter(patient__user=user).select_related('patient__user')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            if not patient_id:
                raise serializers.ValidationError({'patient_id': 'Pasiyent seçilməlidir.'})
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(patient=patient)
        else:
            serializer.save(patient=user.patient_profile)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = True
        task.save(update_fields=['is_completed', 'updated_at'])
        return Response(TaskSerializer(task).data)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            from apps.users.assignments import get_assigned_patients
            assigned = get_assigned_patients(user.psychologist_profile)
            return Goal.objects.filter(patient__in=assigned)
        return Goal.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            if not patient_id:
                raise serializers.ValidationError({'patient_id': 'Pasiyent seçilməlidir.'})
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(patient=patient, psychologist=user.psychologist_profile)
        else:
            patient = user.patient_profile
            psychologists = get_assigned_psychologists(patient)
            serializer.save(patient=patient, psychologist=psychologists.first())