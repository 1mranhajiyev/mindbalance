from django.contrib import admin
from .models import OnboardingAssessment


@admin.register(OnboardingAssessment)
class OnboardingAssessmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'primary_concern', 'preferred_format', 'stress_level', 'created_at']
    search_fields = ['patient__user__full_name']
