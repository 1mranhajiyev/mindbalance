from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.therapy.models import TherapySession, Task
from apps.users.models import PsychologistProfile, PatientProfile
from apps.users.assignments import get_assigned_patients
from apps.users.serializers import PsychologistProfileSerializer, PatientProfileSerializer


class PsychologistViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PsychologistProfile.objects.select_related('user').filter(
        user__is_active=True, is_accepting_patients=True
    )
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['user__full_name', 'specialization']
    filterset_fields = ['is_accepting_patients']


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'psychologist':
            return get_assigned_patients(user.psychologist_profile)
        return PatientProfile.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        data = [
            {
                'id': str(p.id),
                'full_name': p.user.full_name,
                'email': p.user.email,
                'therapy_start_date': p.therapy_start_date,
                'onboarding_status': p.onboarding_status,
            }
            for p in queryset
        ]
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        patient = self.get_object()
        from apps.users.assignments import get_assigned_psychologists
        psychologists = get_assigned_psychologists(patient)
        return Response({
            'id': str(patient.id),
            'full_name': patient.user.full_name,
            'email': patient.user.email,
            'phone': patient.user.phone,
            'therapy_start_date': patient.therapy_start_date,
            'onboarding_status': patient.onboarding_status,
            'psychologists': [
                {'id': str(p.id), 'full_name': p.user.full_name}
                for p in psychologists
            ],
        })


class PsychologistDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        profile = request.user.psychologist_profile
        assigned = get_assigned_patients(profile)
        active_patients = assigned.count()
        total_sessions = TherapySession.objects.filter(psychologist=profile).count()
        pending_tasks = Task.objects.filter(
            patient__in=assigned, is_completed=False
        ).count()
        return Response({
            'active_patients': active_patients,
            'total_sessions': total_sessions,
            'pending_tasks': pending_tasks,
            'session_price': profile.session_price,
        })


class PsychologistStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        profile = request.user.psychologist_profile
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        sessions = TherapySession.objects.filter(psychologist=profile)
        completed = sessions.filter(status='completed').count()
        active_patients = get_assigned_patients(profile).count()
        monthly_revenue = sessions.filter(
            is_paid=True, scheduled_at__gte=month_start
        ).aggregate(total=Sum('price'))['total'] or 0
        return Response({
            'total_sessions': sessions.count(),
            'completed_sessions': completed,
            'active_patients': active_patients,
            'monthly_revenue': monthly_revenue,
        })


class PaymentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        profile = request.user.psychologist_profile
        sessions = TherapySession.objects.filter(
            psychologist=profile, price__isnull=False
        ).select_related('patient__user').order_by('-scheduled_at')
        data = [
            {
                'id': str(s.id),
                'patient_name': s.patient.user.full_name,
                'amount': s.price,
                'status': 'paid' if s.is_paid else 'pending',
                'created_at': s.scheduled_at.isoformat(),
            }
            for s in sessions
        ]
        return Response(data)
