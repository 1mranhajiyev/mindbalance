from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views.auth import (
    RegisterView,
    LoginView,
    MeView,
    MeProfileView,
    PasswordChangeView,
    TwoFASetupView,
    TwoFAVerifyView,
    TwoFADisableView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('me/profile/', MeProfileView.as_view(), name='me-profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('2fa/setup/', TwoFASetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', TwoFAVerifyView.as_view(), name='2fa-verify'),
    path('2fa/disable/', TwoFADisableView.as_view(), name='2fa-disable'),
]
