from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.therapy.views import GoalViewSet

router = DefaultRouter()
router.register('', GoalViewSet, basename='goal')
urlpatterns = router.urls
