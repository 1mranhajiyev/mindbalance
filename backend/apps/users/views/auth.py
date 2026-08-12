from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import UserRole
from apps.users.serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
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
            # Token-a əlavə claim-lər
            refresh['email'] = user.email
            refresh['role'] = user.role
            refresh['full_name'] = user.full_name
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


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
