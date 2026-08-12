import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserRole(models.TextChoices):
    PATIENT = 'patient', 'Pasiyent'
    PSYCHOLOGIST = 'psychologist', 'Psixoloq'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email mütləqdir')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.PSYCHOLOGIST)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.PATIENT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=64, null=True, blank=True)
    totp_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        verbose_name = 'İstifadəçi'
        verbose_name_plural = 'İstifadəçilər'

    def __str__(self):
        return f'{self.full_name} ({self.email})'


class PsychologistProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='psychologist_profile')
    license_number = models.CharField(max_length=100, null=True, blank=True)
    specialization = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    session_price = models.IntegerField(null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    languages = models.CharField(max_length=50, null=True, blank=True)
    is_accepting_patients = models.BooleanField(default=True)

    class Meta:
        db_table = 'psychologist_profiles'
        verbose_name = 'Psixoloq Profili'
        verbose_name_plural = 'Psixoloq Profilləri'

    def __str__(self):
        return f'{self.user.full_name} - Psixoloq'


class PatientProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    age = models.IntegerField(null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    therapy_start_date = models.DateField(null=True, blank=True)
    onboarding_status = models.CharField(
        max_length=30,
        default='not_started',
        choices=[
            ('not_started', 'Başlanmayıb'),
            ('assessment_done', 'Qiymətləndirmə Tamamlandı'),
            ('psychologist_selected', 'Psixoloq Seçildi'),
            ('completed', 'Tamamlandı'),
        ]
    )

    class Meta:
        db_table = 'patient_profiles'
        verbose_name = 'Pasiyent Profili'
        verbose_name_plural = 'Pasiyent Profilləri'

    def __str__(self):
        return f'{self.user.full_name} - Pasiyent'

    @property
    def assigned_psychologists(self):
        return PsychologistProfile.objects.filter(
            patient_assignments__patient=self,
            patient_assignments__is_active=True,
        )


class PatientPsychologistAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name='psychologist_assignments'
    )
    psychologist = models.ForeignKey(
        PsychologistProfile, on_delete=models.CASCADE, related_name='patient_assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'patient_psychologist_assignments'
        unique_together = [['patient', 'psychologist']]
        verbose_name = 'Pasiyent-Psixoloq əlaqəsi'
        verbose_name_plural = 'Pasiyent-Psixoloq əlaqələri'

    def __str__(self):
        return f'{self.patient.user.full_name} ↔ {self.psychologist.user.full_name}'
