from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PsychologistProfile, PatientProfile, PatientPsychologistAssignment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'role', 'is_active', 'is_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified', 'is_staff']
    search_fields = ['email', 'full_name', 'phone']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Şəxsi məlumat', {'fields': ('full_name', 'phone', 'role')}),
        ('İcazələr', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'totp_enabled')}),
        ('Tarixlər', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PsychologistProfile)
class PsychologistProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialization', 'experience_years', 'session_price', 'is_accepting_patients']
    search_fields = ['user__full_name', 'specialization', 'license_number']
    list_filter = ['is_accepting_patients']


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'onboarding_status', 'therapy_start_date']
    search_fields = ['user__full_name']
    list_filter = ['onboarding_status']


@admin.register(PatientPsychologistAssignment)
class PatientPsychologistAssignmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'psychologist', 'is_active', 'assigned_at']
    list_filter = ['is_active']
    search_fields = ['patient__user__full_name', 'psychologist__user__full_name']
