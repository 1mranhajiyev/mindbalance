import uuid
from django.db import models
from apps.users.models import PatientProfile


class OnboardingAssessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.OneToOneField(PatientProfile, on_delete=models.CASCADE, related_name='assessment')
    primary_concern = models.TextField(null=True, blank=True)
    therapy_experience = models.CharField(max_length=50, null=True, blank=True)
    preferred_format = models.CharField(max_length=20, default='online')
    preferred_language = models.CharField(max_length=10, default='az')
    mental_health_history = models.TextField(null=True, blank=True)
    stress_level = models.IntegerField(null=True, blank=True)
    sleep_quality = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onboarding_assessments'
        verbose_name = 'Onboarding Qiymətləndirilməsi'
        verbose_name_plural = 'Onboarding Qiymətləndirilmələri'

    def __str__(self):
        return f'{self.patient.user.full_name} - Assessment'
