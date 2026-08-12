import uuid
from django.db import models
from apps.users.models import PatientProfile, PsychologistProfile


class TherapySession(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Planlaşdırılıb'),
        ('in_progress', 'Davam edir'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'Ləğv edildi'),
    ]
    FORMAT_CHOICES = [
        ('online', 'Online'),
        ('in_person', 'Üz-üzə'),
    ]
    CALL_STATE_CHOICES = [
        ('scheduled', 'Planlaşdırılıb'),
        ('patient_waiting', 'Pasiyent gözləyir'),
        ('psychologist_waiting', 'Psixoloq gözləyir'),
        ('active', 'Canlı'),
        ('completed', 'Bitdi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='sessions')
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE, related_name='sessions')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=50)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='online')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    webrtc_room_id = models.CharField(max_length=255, null=True, blank=True)
    patient_in_call = models.BooleanField(default=False)
    psychologist_in_call = models.BooleanField(default=False)
    call_had_both = models.BooleanField(default=False)
    call_state = models.CharField(max_length=30, choices=CALL_STATE_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'therapy_sessions'
        verbose_name = 'Seans'
        verbose_name_plural = 'Seanslar'
        ordering = ['-scheduled_at']

    def __str__(self):
        return f'{self.patient.user.full_name} - {self.psychologist.user.full_name} ({self.scheduled_at.date()})'


class SessionWebRTCSignal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        TherapySession, on_delete=models.CASCADE, related_name='webrtc_signals'
    )
    from_role = models.CharField(max_length=20)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'session_webrtc_signals'
        ordering = ['created_at']


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(TherapySession, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'
        verbose_name = 'Tapşırıq'
        verbose_name_plural = 'Tapşırıqlar'

    def __str__(self):
        return self.title


class Goal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='goals')
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='set_goals')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    is_achieved = models.BooleanField(default=False)
    initial_score = models.IntegerField(default=5)
    current_score = models.IntegerField(default=5)
    target_score = models.IntegerField(default=10)
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        verbose_name = 'Hədəf'
        verbose_name_plural = 'Hədəflər'

    def __str__(self):
        return self.title


class Milestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'milestones'
        verbose_name = 'Mərhələ'
        verbose_name_plural = 'Mərhələlər'

    def __str__(self):
        return self.title


class GoalProgressLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='progress_logs')
    score = models.IntegerField()
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'goal_progress_logs'
        ordering = ['-created_at']


class TherapyTimelineEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='timeline_events')
    psychologist = models.ForeignKey(
        PsychologistProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='timeline_events'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    event_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'therapy_timeline_events'
        ordering = ['-event_date']


class PatientAchievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    achieved_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patient_achievements'
        ordering = ['-achieved_at']


class TherapyLearning(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='learnings')
    session = models.ForeignKey(
        TherapySession, on_delete=models.SET_NULL, null=True, blank=True, related_name='learnings'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'therapy_learnings'
        ordering = ['-created_at']
