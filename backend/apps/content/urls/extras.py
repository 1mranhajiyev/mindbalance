from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.content.views import (
    NoteViewSet,
    CheckInViewSet,
    NotificationViewSet,
    ThoughtRecordViewSet,
    MaterialViewSet,
    PatientMaterialViewSet,
    ProgressComparisonView,
)

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('thoughts', ThoughtRecordViewSet, basename='thoughts')
router.register('materials', MaterialViewSet, basename='materials')
router.register('patient-materials', PatientMaterialViewSet, basename='patient-materials')

urlpatterns = [
    path('progress/comparison/', ProgressComparisonView.as_view(), name='progress-comparison'),
    path('', include(router.urls)),
]
