from django.utils import timezone
from rest_framework import viewsets, permissions, serializers
from rest_framework.exceptions import PermissionDenied
from apps.users.assignments import get_assigned_patient_or_404, get_assigned_patients
from .models import Milestone, Goal, TherapyTimelineEvent, PatientAchievement, TherapyLearning
from .serializers import (
    MilestoneSerializer,
    TherapyTimelineEventSerializer,
    PatientAchievementSerializer,
    TherapyLearningSerializer,
)


class _PatientScopedMixin:
    def _patient_queryset(self, model):
        user = self.request.user
        if user.role == 'psychologist':
            assigned = get_assigned_patients(user.psychologist_profile)
            return model.objects.filter(patient__in=assigned)
        return model.objects.filter(patient__user=user)


class MilestoneViewSet(_PatientScopedMixin, viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Milestone.objects.select_related('goal')
        goal_id = self.request.query_params.get('goal')
        if goal_id:
            qs = qs.filter(goal_id=goal_id)
        user = self.request.user
        if user.role == 'psychologist':
            assigned = get_assigned_patients(user.psychologist_profile)
            return qs.filter(goal__patient__in=assigned)
        return qs.filter(goal__patient__user=user)

    def perform_create(self, serializer):
        goal_id = self.request.data.get('goal_id') or self.request.data.get('goal')
        if not goal_id:
            raise serializers.ValidationError({'goal_id': 'Məqsəd seçilməlidir.'})
        goal = Goal.objects.get(pk=goal_id)
        user = self.request.user
        if user.role == 'patient' and goal.patient.user_id != user.id:
            raise PermissionDenied('Bu məqsədə giriş yoxdur.')
        if user.role == 'psychologist':
            get_assigned_patient_or_404(goal.patient_id, user.psychologist_profile)
        serializer.save(goal=goal)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.is_completed and not instance.completed_at:
            instance.completed_at = timezone.now()
            instance.save(update_fields=['completed_at'])


class TherapyTimelineViewSet(_PatientScopedMixin, viewsets.ModelViewSet):
    serializer_class = TherapyTimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self._patient_queryset(TherapyTimelineEvent)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(patient=patient, psychologist=user.psychologist_profile)
        else:
            psychologists = user.patient_profile.assigned_psychologists
            serializer.save(patient=user.patient_profile, psychologist=psychologists.first())


class PatientAchievementViewSet(_PatientScopedMixin, viewsets.ModelViewSet):
    serializer_class = PatientAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self._patient_queryset(PatientAchievement)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(patient=patient)
        else:
            serializer.save(patient=user.patient_profile)


class TherapyLearningViewSet(_PatientScopedMixin, viewsets.ModelViewSet):
    serializer_class = TherapyLearningSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self._patient_queryset(TherapyLearning)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'psychologist':
            patient_id = self.request.data.get('patient_id')
            patient = get_assigned_patient_or_404(patient_id, user.psychologist_profile)
            serializer.save(patient=patient)
        else:
            serializer.save(patient=user.patient_profile)
