from rest_framework import viewsets, permissions
from .models import Note, CheckIn, Notification
from .serializers import NoteSerializer, CheckInSerializer, NotificationSerializer


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return Note.objects.filter(psychologist__user=user)
        return Note.objects.filter(patient__user=user)


class CheckInViewSet(viewsets.ModelViewSet):
    serializer_class = CheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CheckIn.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
