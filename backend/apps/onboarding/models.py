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
    therapy_reason = models.TextField(null=True, blank=True)
    main_concern = models.TextField(null=True, blank=True)
    desired_change = models.TextField(null=True, blank=True)
    therapy_expectation = models.TextField(null=True, blank=True)
    life_difficulties = models.TextField(null=True, blank=True)
    anxiety_score = models.IntegerField(null=True, blank=True)
    self_confidence_score = models.IntegerField(null=True, blank=True)
    stress_score = models.IntegerField(null=True, blank=True)
    relationships_score = models.IntegerField(null=True, blank=True)
    boundaries_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onboarding_assessments'
        verbose_name = 'Onboarding Qiymətləndirilməsi'
        verbose_name_plural = 'Onboarding Qiymətləndirilmələri'

    def __str__(self):
        return f'{self.patient.user.full_name} - Assessment'


class PatientConnectionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Gözləyir'),
        ('accepted', 'Qəbul edilib'),
        ('rejected', 'Rədd edilib'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='connection_requests')
    psychologist = models.ForeignKey(
        'users.PsychologistProfile', on_delete=models.CASCADE, related_name='connection_requests'
    )
    message = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'patient_connection_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient.user.full_name} → {self.psychologist.user.full_name} ({self.status})'
