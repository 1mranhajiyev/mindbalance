from rest_framework.routers import DefaultRouter
from apps.therapy.wellness_views import (
    MilestoneViewSet,
    TherapyTimelineViewSet,
    PatientAchievementViewSet,
    TherapyLearningViewSet,
)

router = DefaultRouter()
router.register('milestones', MilestoneViewSet, basename='milestone')
router.register('timeline', TherapyTimelineViewSet, basename='timeline')
router.register('achievements', PatientAchievementViewSet, basename='achievement')
router.register('learnings', TherapyLearningViewSet, basename='learning')

urlpatterns = router.urls
