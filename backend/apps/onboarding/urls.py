from django.urls import path
from .views import (
    OnboardingAssessmentView,
    OnboardingStatusView,
    OnboardingPsychologistsView,
    OnboardingRequestView,
    MyRequestsView,
    MyPsychologistsView,
    PendingRequestsView,
    RespondRequestView,
)

urlpatterns = [
    path('status/', OnboardingStatusView.as_view(), name='onboarding-status'),
    path('assessment/', OnboardingAssessmentView.as_view(), name='onboarding-assessment'),
    path('psychologists/', OnboardingPsychologistsView.as_view(), name='onboarding-psychologists'),
    path('request/', OnboardingRequestView.as_view(), name='onboarding-request'),
    path('my-requests/', MyRequestsView.as_view(), name='onboarding-my-requests'),
    path('my-psychologists/', MyPsychologistsView.as_view(), name='onboarding-my-psychologists'),
    path('pending-requests/', PendingRequestsView.as_view(), name='onboarding-pending-requests'),
    path('respond/<uuid:pk>/', RespondRequestView.as_view(), name='onboarding-respond'),
]
