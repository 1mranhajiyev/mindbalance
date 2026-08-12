import uuid
from django.db import models
from apps.users.models import PatientProfile, PsychologistProfile


class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    session = models.ForeignKey(
        'therapy.TherapySession', on_delete=models.SET_NULL, null=True, blank=True, related_name='notes'
    )
    title = models.CharField(max_length=255, blank=True, default='')
    content = models.TextField()
    emotion = models.CharField(max_length=100, null=True, blank=True)
    event = models.CharField(max_length=255, null=True, blank=True)
    note_type = models.CharField(max_length=20, default='clinical')
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes'
        verbose_name = 'Qeyd'
        verbose_name_plural = 'Qeydlər'

    def __str__(self):
        return self.title


class CheckIn(models.Model):
    MOOD_CHOICES = [(i, str(i)) for i in range(1, 11)]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='checkins')
    session = models.ForeignKey(
        'therapy.TherapySession', on_delete=models.SET_NULL, null=True, blank=True, related_name='checkins'
    )
    mood_score = models.IntegerField(choices=MOOD_CHOICES, null=True, blank=True)
    emotion = models.CharField(max_length=50, null=True, blank=True)
    intensity = models.IntegerField(null=True, blank=True)
    cause = models.TextField(null=True, blank=True)
    checkin_type = models.CharField(max_length=20, default='daily')
    energy_level = models.IntegerField(null=True, blank=True)
    anxiety_level = models.IntegerField(null=True, blank=True)
    sleep_hours = models.FloatField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'checkins'
        verbose_name = 'Gündəlik Check-in'
        verbose_name_plural = 'Gündəlik Check-inlər'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient.user.full_name} - {self.mood_score}/10 ({self.created_at.date()})'


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Bildiriş'
        verbose_name_plural = 'Bildirişlər'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ThoughtRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='thoughts')
    situation = models.TextField()
    automatic_thought = models.TextField()
    emotion = models.CharField(max_length=100)
    intensity = models.IntegerField(default=5)
    alternative_thought = models.TextField(null=True, blank=True)
    cognitive_distortion = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'thought_records'
        ordering = ['-created_at']


class Material(models.Model):
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('other', 'Other'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='materials/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'materials'
        ordering = ['-created_at']


class PatientMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='received_materials')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='assignments')
    sent_by = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE, related_name='sent_materials')
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patient_materials'
        ordering = ['-sent_at']
