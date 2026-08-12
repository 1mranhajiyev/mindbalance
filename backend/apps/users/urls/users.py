from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views.users import PsychologistViewSet, PatientViewSet

router = DefaultRouter()
router.register('psychologists', PsychologistViewSet, basename='psychologist')
router.register('patients', PatientViewSet, basename='patient')

urlpatterns = router.urls
