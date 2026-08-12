from rest_framework import generics, permissions
from .models import OnboardingAssessment
from .serializers import OnboardingAssessmentSerializer


class OnboardingAssessmentView(generics.RetrieveUpdateAPIView):
    serializer_class = OnboardingAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = OnboardingAssessment.objects.get_or_create(
            patient=self.request.user.patient_profile
        )
        return obj
