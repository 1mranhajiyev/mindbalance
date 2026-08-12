from django.urls import path
from .views import OnboardingAssessmentView

urlpatterns = [
    path('assessment/', OnboardingAssessmentView.as_view(), name='onboarding-assessment'),
]
