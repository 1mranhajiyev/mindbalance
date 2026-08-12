from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.users.views.users import (
    PatientViewSet,
    PsychologistDashboardView,
    PsychologistStatisticsView,
    PaymentsView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls.auth')),
    path('api/v1/users/', include('apps.users.urls.users')),
    path('api/v1/patients/', PatientViewSet.as_view({'get': 'list'}), name='patients-alias-list'),
    path('api/v1/patients/<uuid:pk>/', PatientViewSet.as_view({'get': 'retrieve'}), name='patients-alias-detail'),
    path('api/v1/psychologists/dashboard/', PsychologistDashboardView.as_view(), name='psychologists-dashboard'),
    path('api/v1/psychologist/statistics/', PsychologistStatisticsView.as_view(), name='psychologist-statistics'),
    path('api/v1/payments/', PaymentsView.as_view(), name='payments'),
    path('api/v1/sessions/', include('apps.therapy.urls.sessions')),
    path('api/v1/tasks/', include('apps.therapy.urls.tasks')),
    path('api/v1/goals/', include('apps.therapy.urls.goals')),
    path('api/v1/checkins/', include('apps.content.urls.checkins')),
    path('api/v1/notes/', include('apps.content.urls.notes')),
    path('api/v1/onboarding/', include('apps.onboarding.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
