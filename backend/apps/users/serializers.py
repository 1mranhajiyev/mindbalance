from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, PsychologistProfile, PatientProfile, UserRole


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'role', 'phone']

    def validate_phone(self, value):
        # Boş string-i None-a çevir (UniqueViolation problemini həll edir)
        if value == '':
            return None
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=validated_data.get('role', UserRole.PATIENT),
            phone=validated_data.get('phone'),
        )
        # Rol əsasında profil yarat
        if user.role == UserRole.PSYCHOLOGIST:
            PsychologistProfile.objects.create(user=user)
        else:
            PatientProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'phone', 'is_verified',
                  'totp_enabled', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'role', 'created_at', 'updated_at', 'is_verified']


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['age', 'birth_date']


class PatientProfileReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['id', 'age', 'birth_date', 'therapy_start_date', 'onboarding_status']
        read_only_fields = ['id', 'therapy_start_date', 'onboarding_status']


class PsychologistProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologistProfile
        fields = [
            'license_number', 'specialization', 'bio', 'session_price',
            'experience_years', 'languages', 'is_accepting_patients',
        ]


class PsychologistProfileReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologistProfile
        fields = [
            'id', 'license_number', 'specialization', 'bio', 'session_price',
            'experience_years', 'languages', 'is_accepting_patients',
        ]
        read_only_fields = ['id']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token


class PsychologistProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PsychologistProfile
        fields = '__all__'


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = '__all__'
