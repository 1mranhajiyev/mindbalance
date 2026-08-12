from django.urls import path
from .views import (
    OnboardingAssessmentView,
    OnboardingStatusView,
    OnboardingPsychologistsView,
    OnboardingRequestView,
    PendingRequestsView,
    RespondRequestView,
)

urlpatterns = [
    path('status/', OnboardingStatusView.as_view(), name='onboarding-status'),
    path('assessment/', OnboardingAssessmentView.as_view(), name='onboarding-assessment'),
    path('psychologists/', OnboardingPsychologistsView.as_view(), name='onboarding-psychologists'),
    path('request/', OnboardingRequestView.as_view(), name='onboarding-request'),
    path('pending-requests/', PendingRequestsView.as_view(), name='onboarding-pending-requests'),
    path('respond/<uuid:pk>/', RespondRequestView.as_view(), name='onboarding-respond'),
]
