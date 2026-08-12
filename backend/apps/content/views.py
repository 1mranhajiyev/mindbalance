from django.db.models import Avg
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.assignments import get_assigned_patient_or_404, get_assigned_patients
from apps.onboarding.models import OnboardingAssessment
from apps.therapy.models import TherapySession
from .models import Note, CheckIn, Notification, ThoughtRecord, Material, PatientMaterial
from .serializers import (
    NoteSerializer,
    CheckInSerializer,
    NotificationSerializer,
    ThoughtRecordSerializer,
    MaterialSerializer,
    PatientMaterialSerializer,
)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        note_type = self.request.query_params.get('note_type')
        qs = Note.objects.all()
        if note_type:
            qs = qs.filter(note_type=note_type)
        if user.role == 'psychologist':
            return qs.filter(psychologist__user=user).select_related('patient__user')
        return qs.filter(patient__user=user, is_private=True).select_related('patient__user')

    def perform_create(self, serializer):
        user = self.request.user
        content = self.request.data.get('content', '')
        title = self.request.data.get('title') or (content[:50] if content else 'Qeyd')
        session_id = self.request.data.get('session') or self.request.data.get('session_id')
        session = None
        if session_id:
            session = TherapySession.objects.filter(pk=session_id).first()
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            patient = None
            if patient_id:
                patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(
                psychologist=user.psychologist_profile,
                patient=patient,
                session=session,
                title=title,
                note_type=self.request.data.get('note_type', 'clinical'),
            )
        else:
            serializer.save(
                patient=user.patient_profile,
                session=session,
                title=title,
                note_type='journal',
                is_private=True,
            )

    @action(detail=False, methods=['get', 'post'], url_path='journal')
    def journal(self, request):
        if request.method == 'GET':
            notes = Note.objects.filter(
                patient__user=request.user, note_type='journal', is_private=True
            ).order_by('-created_at')
            return Response(NoteSerializer(notes, many=True).data)
        content = request.data.get('content', '')
        title = content[:50] if content else 'Gündəlik'
        note = Note.objects.create(
            patient=request.user.patient_profile,
            title=title,
            content=content,
            emotion=request.data.get('emotion'),
            event=request.data.get('event'),
            note_type='journal',
            is_private=True,
        )
        return Response(NoteSerializer(note).data, status=201)


class CheckInViewSet(viewsets.ModelViewSet):
    serializer_class = CheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CheckIn.objects.filter(patient__user=user)
        session_id = self.request.query_params.get('session')
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs

    def perform_create(self, serializer):
        session_id = self.request.data.get('session_id') or self.request.data.get('session')
        session = None
        if session_id:
            session = TherapySession.objects.filter(
                pk=session_id, patient__user=self.request.user
            ).first()
        intensity = serializer.validated_data.get('intensity')
        serializer.save(
            patient=self.request.user.patient_profile,
            session=session,
            mood_score=intensity or serializer.validated_data.get('mood_score', 5),
        )


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'ok': True})


class ThoughtRecordViewSet(viewsets.ModelViewSet):
    serializer_class = ThoughtRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            assigned = get_assigned_patients(user.psychologist_profile)
            return ThoughtRecord.objects.filter(patient__in=assigned)
        return ThoughtRecord.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        if self.request.user.role != 'patient':
            raise PermissionDenied('Yalnız pasiyent düşüncə qeydi yarada bilər.')
        serializer.save(patient=self.request.user.patient_profile)


class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return Material.objects.filter(psychologist__user=user)
        return Material.objects.none()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        file_type = self.request.data.get('file_type', 'other')
        serializer.save(psychologist=self.request.user.psychologist_profile, file_type=file_type)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        material = self.get_object()
        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response({'detail': 'patient_id tələb olunur.'}, status=400)
        patient = get_assigned_patient_or_404(patient_id, request.user.psychologist_profile)
        pm, created = PatientMaterial.objects.get_or_create(
            patient=patient,
            material=material,
            defaults={'sent_by': request.user.psychologist_profile},
        )
        if not created:
            return Response({'detail': 'Material artıq göndərilib.'}, status=400)
        Notification.objects.create(
            user=patient.user,
            title='Yeni material',
            body=f'{material.title} — psixoloqunuzdan yeni material.',
        )
        return Response(PatientMaterialSerializer(pm, context={'request': request}).data, status=201)


class PatientMaterialViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return PatientMaterial.objects.filter(patient__user=user).select_related('material')
        assigned = get_assigned_patients(user.psychologist_profile)
        return PatientMaterial.objects.filter(patient__in=assigned).select_related('material')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        pm = self.get_object()
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyent oxuya bilər.'}, status=403)
        pm.is_read = True
        pm.save(update_fields=['is_read'])
        return Response(PatientMaterialSerializer(pm, context={'request': request}).data)


class ProgressComparisonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        patient = request.user.patient_profile
        assessment = OnboardingAssessment.objects.filter(patient=patient).first()
        if not assessment:
            return Response({'detail': 'Qiymətləndirmə tapılmadı.'}, status=404)
        recent = CheckIn.objects.filter(patient=patient).order_by('-created_at')[:14]
        avg_intensity = recent.aggregate(v=Avg('intensity'))['v']
        return Response({
            'before': {
                'anxiety': assessment.anxiety_score,
                'stress': assessment.stress_score,
                'self_confidence': assessment.self_confidence_score,
                'relationships': assessment.relationships_score,
                'boundaries': assessment.boundaries_score,
            },
            'now': {
                'avg_intensity': round(avg_intensity, 1) if avg_intensity is not None else None,
                'checkin_count': recent.count(),
            },
        })
