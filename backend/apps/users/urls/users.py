from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.users.views.users import (
    PsychologistViewSet,
    PatientViewSet,
    PsychologistDashboardView,
    PsychologistStatisticsView,
    PaymentsView,
)

router = DefaultRouter()
router.register('psychologists', PsychologistViewSet, basename='psychologist')
router.register('patients', PatientViewSet, basename='patient')

urlpatterns = [
    path('psychologists/dashboard/', PsychologistDashboardView.as_view(), name='psychologist-dashboard'),
    path('psychologist/statistics/', PsychologistStatisticsView.as_view(), name='psychologist-statistics'),
    path('payments/', PaymentsView.as_view(), name='payments'),
] + router.urls
