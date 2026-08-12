from rest_framework import serializers
from .models import OnboardingAssessment


class OnboardingAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingAssessment
        fields = '__all__'
        read_only_fields = ['patient', 'created_at', 'updated_at']
