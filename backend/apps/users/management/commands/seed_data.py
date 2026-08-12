from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from apps.users.models import User, UserRole, PsychologistProfile, PatientProfile
from apps.onboarding.models import OnboardingAssessment, PatientConnectionRequest
from apps.therapy.models import TherapySession, Task, Goal
from apps.content.models import Note, CheckIn


class Command(BaseCommand):
    help = 'MindBalance mock məlumatları yükləyir'

    def handle(self, *args, **options):
        self.stdout.write('Mock məlumatlar yaradılır...')

        psych1, created = User.objects.get_or_create(
            email='leyla.psixoloq@mindbalance.az',
            defaults={
                'full_name': 'Leyla Əliyeva',
                'role': UserRole.PSYCHOLOGIST,
                'phone': '+994501111111',
            },
        )
        psych1.set_password('SecurePass1!')
        psych1.save()

        psych1_profile, _ = PsychologistProfile.objects.get_or_create(
            user=psych1,
            defaults={
                'specialization': 'KBT, Anksiyete',
                'bio': '8 illik təcrübəli klinik psixoloq.',
                'session_price': 50,
                'experience_years': 8,
                'languages': 'az,en',
                'license_number': 'PSY-001',
            },
        )

        psych2, created = User.objects.get_or_create(
            email='rauf.psixoloq@mindbalance.az',
            defaults={
                'full_name': 'Rauf Hüseynov',
                'role': UserRole.PSYCHOLOGIST,
                'phone': '+994502222222',
            },
        )
        psych2.set_password('SecurePass1!')
        psych2.save()

        PsychologistProfile.objects.get_or_create(
            user=psych2,
            defaults={
                'specialization': 'Schema Therapy',
                'bio': 'Münasibət və özünəinam üzrə mütəxəssis.',
                'session_price': 60,
                'experience_years': 12,
                'languages': 'az,ru',
                'license_number': 'PSY-002',
            },
        )

        patient1, created = User.objects.get_or_create(
            email='ayse.pasient@mindbalance.az',
            defaults={
                'full_name': 'Ayşə Məmmədova',
                'role': UserRole.PATIENT,
                'phone': '+994503333333',
            },
        )
        patient1.set_password('SecurePass1!')
        patient1.save()

        patient1_profile, _ = PatientProfile.objects.get_or_create(
            user=patient1,
            defaults={
                'psychologist': psych1_profile,
                'onboarding_status': 'completed',
                'therapy_start_date': date.today() - timedelta(days=30),
            },
        )
        patient1_profile.psychologist = psych1_profile
        patient1_profile.onboarding_status = 'completed'
        patient1_profile.therapy_start_date = date.today() - timedelta(days=30)
        patient1_profile.save()

        patient2, created = User.objects.get_or_create(
            email='kamran.pasient@mindbalance.az',
            defaults={
                'full_name': 'Kamran Hacılı',
                'role': UserRole.PATIENT,
                'phone': '+994504444444',
            },
        )
        patient2.set_password('SecurePass1!')
        patient2.save()

        PatientProfile.objects.get_or_create(
            user=patient2,
            defaults={'onboarding_status': 'not_started'},
        )

        OnboardingAssessment.objects.get_or_create(patient=patient1_profile)

        now = timezone.now()
        session1, _ = TherapySession.objects.get_or_create(
            patient=patient1_profile,
            psychologist=psych1_profile,
            scheduled_at=now + timedelta(days=2),
            defaults={
                'duration_minutes': 50,
                'format': 'online',
                'status': 'scheduled',
                'price': 50,
                'is_paid': False,
            },
        )

        TherapySession.objects.get_or_create(
            patient=patient1_profile,
            psychologist=psych1_profile,
            scheduled_at=now - timedelta(days=7),
            defaults={
                'duration_minutes': 50,
                'format': 'online',
                'status': 'completed',
                'price': 50,
                'is_paid': True,
            },
        )

        Task.objects.get_or_create(
            patient=patient1_profile,
            title='Gündəlik nəfəs məşqi',
            defaults={
                'description': 'Hər gün 10 dəqiqə nəfəs məşqi edin.',
                'due_date': date.today() + timedelta(days=3),
                'is_completed': False,
            },
        )

        Task.objects.get_or_create(
            patient=patient1_profile,
            title='Gündəlik yazı',
            defaults={
                'description': '3 minnət duyğusu yazın.',
                'due_date': date.today() - timedelta(days=1),
                'is_completed': True,
            },
        )

        Goal.objects.get_or_create(
            patient=patient1_profile,
            psychologist=psych1_profile,
            title='Anksiyeteni azaltmaq',
            defaults={
                'description': 'Gündəlik anksiyete səviyyəsini 4-ə endirmək',
                'initial_score': 8,
                'current_score': 5,
                'target_score': 4,
                'is_achieved': False,
            },
        )

        Goal.objects.get_or_create(
            patient=patient1_profile,
            psychologist=psych1_profile,
            title='Özünəinam artırmaq',
            defaults={
                'initial_score': 4,
                'current_score': 6,
                'target_score': 8,
                'is_achieved': False,
            },
        )

        for i, emotion in enumerate(['narahat', 'sakit', 'xoşbəxt', 'narahat', 'sakit']):
            checkin_time = now - timedelta(days=i)
            if not CheckIn.objects.filter(patient=patient1_profile, created_at__date=checkin_time.date()).exists():
                CheckIn.objects.create(
                    patient=patient1_profile,
                    emotion=emotion,
                    intensity=7 - i,
                    cause='Gündəlik check-in',
                    checkin_type='daily',
                    mood_score=7 - i,
                )

        Note.objects.get_or_create(
            patient=patient1_profile,
            title='Bugünkü hiss',
            content='Bu gün özümü daha sakit hiss etdim.',
            defaults={
                'note_type': 'journal',
                'emotion': 'sakit',
                'event': 'Gəzinti',
                'is_private': True,
            },
        )

        Note.objects.get_or_create(
            patient=patient1_profile,
            psychologist=psych1_profile,
            title='1-ci seans qeydi',
            content='Pasiyent anksiyete ilə müraciət etdi. KBT planı başladıldı.',
            defaults={'note_type': 'clinical', 'is_private': False},
        )

        self.stdout.write(self.style.SUCCESS('Mock məlumatlar uğurla yükləndi!'))
        self.stdout.write('')
        self.stdout.write('Test hesabları (parol: SecurePass1!):')
        self.stdout.write('  Psixoloq: leyla.psixoloq@mindbalance.az')
        self.stdout.write('  Psixoloq: rauf.psixoloq@mindbalance.az')
        self.stdout.write('  Pasiyent (tam onboarding): ayse.pasient@mindbalance.az')
        self.stdout.write('  Pasiyent (yeni): kamran.pasient@mindbalance.az')
