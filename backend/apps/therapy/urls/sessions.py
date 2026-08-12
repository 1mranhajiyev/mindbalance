from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.therapy.views import TherapySessionViewSet

router = DefaultRouter()
router.register('', TherapySessionViewSet, basename='session')
urlpatterns = router.urls
