from rest_framework import serializers
from .models import OnboardingAssessment, PatientConnectionRequest


class OnboardingAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingAssessment
        fields = [
            'id', 'therapy_reason', 'main_concern', 'desired_change', 'therapy_expectation',
            'life_difficulties', 'anxiety_score', 'self_confidence_score', 'stress_score',
            'relationships_score', 'boundaries_score', 'primary_concern', 'therapy_experience',
            'preferred_format', 'preferred_language', 'mental_health_history', 'stress_level',
            'sleep_quality', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientConnectionRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    psychologist_name = serializers.CharField(source='psychologist.user.full_name', read_only=True)

    class Meta:
        model = PatientConnectionRequest
        fields = [
            'id', 'patient', 'psychologist', 'patient_name', 'psychologist_name',
            'message', 'status', 'created_at', 'responded_at',
        ]
        read_only_fields = ['id', 'patient', 'status', 'created_at', 'responded_at']


class ConnectionRequestCreateSerializer(serializers.Serializer):
    psychologist_id = serializers.UUIDField()
    message = serializers.CharField(required=False, allow_blank=True)


class ConnectionRespondSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['accepted', 'rejected'])


class PsychologistListSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    full_name = serializers.CharField()
    specialization = serializers.CharField(allow_null=True)
    bio = serializers.CharField(allow_null=True)
    session_price = serializers.IntegerField(allow_null=True)
    experience_years = serializers.IntegerField(allow_null=True)
    languages = serializers.CharField(allow_null=True)
