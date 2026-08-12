from rest_framework import viewsets, permissions
from apps.users.models import PsychologistProfile, PatientProfile
from apps.users.serializers import PsychologistProfileSerializer, PatientProfileSerializer


class PsychologistViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PsychologistProfile.objects.select_related('user').filter(
        user__is_active=True, is_accepting_patients=True
    )
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['user__full_name', 'specialization']
    filterset_fields = ['is_accepting_patients']


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return PatientProfile.objects.filter(
                psychologist__user=user
            ).select_related('user', 'psychologist')
        return PatientProfile.objects.filter(user=user)
