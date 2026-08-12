from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from apps.audit.utils import log_action
from apps.users.models import User, UserRole
from apps.users.totp import generate_totp_secret, verify_totp, get_totp_uri
from apps.users.serializers import (
    RegisterSerializer,
    UserSerializer,
    PatientProfileReadSerializer,
    PatientProfileUpdateSerializer,
    PsychologistProfileReadSerializer,
    PsychologistProfileUpdateSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email
            refresh['role'] = user.role
            refresh['full_name'] = user.full_name
            log_action(request, 'register', 'user', user.id)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        totp_code = request.data.get('totp_code')

        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({'detail': 'Email və ya parol səhvdir.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'Hesab deaktivdir.'}, status=status.HTTP_403_FORBIDDEN)

        if user.totp_enabled:
            if not totp_code:
                return Response({'requires_2fa': True}, status=status.HTTP_200_OK)
            if not verify_totp(user.totp_secret, totp_code):
                return Response({'detail': '2FA kodu səhvdir.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name
        log_action(request, 'login', 'user', user.id)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def _build_response(self, user):
        data = UserSerializer(user).data
        if user.role == UserRole.PATIENT:
            data['profile'] = PatientProfileReadSerializer(user.patient_profile).data
        else:
            data['profile'] = PsychologistProfileReadSerializer(user.psychologist_profile).data
        return data

    def get(self, request):
        return Response(self._build_response(request.user))

    def patch(self, request):
        user = request.user
        errors = {}
        user_fields = {}
        for field in ('full_name', 'phone'):
            if field in request.data:
                user_fields[field] = request.data[field]
        if user_fields.get('phone') == '':
            user_fields['phone'] = None
        if user_fields:
            user_serializer = UserSerializer(user, data=user_fields, partial=True)
            if not user_serializer.is_valid():
                errors.update(user_serializer.errors)
            else:
                user_serializer.save()
        profile_data = request.data.get('profile', {})
        if profile_data:
            if user.role == UserRole.PATIENT:
                profile_serializer = PatientProfileUpdateSerializer(
                    user.patient_profile, data=profile_data, partial=True
                )
            else:
                profile_serializer = PsychologistProfileUpdateSerializer(
                    user.psychologist_profile, data=profile_data, partial=True
                )
            if not profile_serializer.is_valid():
                errors['profile'] = profile_serializer.errors
            else:
                profile_serializer.save()
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        return Response(self._build_response(user))


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        if not request.user.check_password(current):
            return Response({'detail': 'Cari parol səhvdir.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])
        log_action(request, 'password_change', 'user', request.user.id)
        return Response({'message': 'Parol yeniləndi.'})


class TwoFASetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        secret = generate_totp_secret()
        request.user.totp_secret = secret
        request.user.totp_enabled = False
        request.user.save(update_fields=['totp_secret', 'totp_enabled'])
        return Response({
            'secret': secret,
            'uri': get_totp_uri(secret, request.user.email),
        })


class TwoFAVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        if not request.user.totp_secret:
            return Response({'detail': '2FA quraşdırılmayıb.'}, status=status.HTTP_400_BAD_REQUEST)
        if not verify_totp(request.user.totp_secret, code):
            return Response({'detail': 'Kod səhvdir.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.totp_enabled = True
        request.user.save(update_fields=['totp_enabled'])
        log_action(request, '2fa_enabled', 'user', request.user.id)
        return Response({'message': '2FA aktivləşdirildi.'})


class TwoFADisableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        password = request.data.get('password', '')
        if not request.user.check_password(password):
            return Response({'detail': 'Parol səhvdir.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.totp_enabled and not verify_totp(request.user.totp_secret, code):
            return Response({'detail': '2FA kodu səhvdir.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.totp_enabled = False
        request.user.totp_secret = None
        request.user.save(update_fields=['totp_enabled', 'totp_secret'])
        log_action(request, '2fa_disabled', 'user', request.user.id)
        return Response({'message': '2FA söndürüldü.'})
