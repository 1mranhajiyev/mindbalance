from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.users.assignments import get_assigned_patient_or_404, get_assigned_psychologists, is_assigned
from .models import TherapySession, Task, Goal
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
            psychologist_id = self.request.data.get('psychologist_id')
            psychologists = get_assigned_psychologists(patient)
            if not psychologists.exists():
                raise serializers.ValidationError({'detail': 'Əvvəlcə psixoloq assign olunmalıdır.'})
            if psychologist_id:
                psychologist = psychologists.get(id=psychologist_id)
            else:
                psychologist = psychologists.first()
            serializer.save(patient=patient, psychologist=psychologist)


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
