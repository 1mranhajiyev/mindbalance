from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TherapySession, Task, Goal, Milestone
from .serializers import TherapySessionSerializer, TaskSerializer, GoalSerializer, MilestoneSerializer


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


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return Task.objects.filter(patient__psychologist__user=user)
        return Task.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return Goal.objects.filter(psychologist__user=user)
        return Goal.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)
