from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.models import PsychologistProfile
from apps.users.assignments import assign_patient_to_psychologist, get_assigned_psychologists, is_assigned
from .models import OnboardingAssessment, PatientConnectionRequest
from .serializers import (
    OnboardingAssessmentSerializer,
    PatientConnectionRequestSerializer,
    PendingRequestDetailSerializer,
    ConnectionRequestCreateSerializer,
    ConnectionRespondSerializer,
)


class OnboardingStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        profile = request.user.patient_profile
        assigned = get_assigned_psychologists(profile)
        pending_count = PatientConnectionRequest.objects.filter(
            patient=profile, status='pending'
        ).count()
        return Response({
            'onboarding_status': profile.onboarding_status,
            'assigned_psychologists_count': assigned.count(),
            'pending_requests_count': pending_count,
        })


class OnboardingAssessmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        assessment, _ = OnboardingAssessment.objects.get_or_create(patient=request.user.patient_profile)
        return Response(OnboardingAssessmentSerializer(assessment).data)

    def post(self, request):
        return self._save(request)

    def patch(self, request):
        return self._save(request)

    def _save(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        profile = request.user.patient_profile
        assessment, _ = OnboardingAssessment.objects.get_or_create(patient=profile)
        serializer = OnboardingAssessmentSerializer(assessment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        profile.onboarding_status = 'completed'
        if not profile.therapy_start_date:
            profile.therapy_start_date = timezone.now().date()
        profile.save(update_fields=['onboarding_status', 'therapy_start_date'])
        return Response(serializer.data)


class OnboardingPsychologistsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.patient_profile if request.user.role == 'patient' else None
        psychologists = PsychologistProfile.objects.select_related('user').filter(
            user__is_active=True, is_accepting_patients=True
        )
        assigned_ids = set()
        pending_ids = set()
        if profile:
            assigned_ids = set(
                get_assigned_psychologists(profile).values_list('id', flat=True)
            )
            pending_ids = set(
                PatientConnectionRequest.objects.filter(
                    patient=profile, status='pending'
                ).values_list('psychologist_id', flat=True)
            )

        data = []
        for p in psychologists:
            pid = p.id
            rel_status = 'available'
            if pid in assigned_ids:
                rel_status = 'assigned'
            elif pid in pending_ids:
                rel_status = 'pending'
            data.append({
                'id': str(p.id),
                'full_name': p.user.full_name,
                'specialization': p.specialization,
                'bio': p.bio,
                'session_price': p.session_price,
                'experience_years': p.experience_years,
                'languages': p.languages,
                'relationship_status': rel_status,
            })
        return Response(data)


class OnboardingRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        profile = request.user.patient_profile
        if profile.onboarding_status == 'not_started':
            return Response({'detail': 'Əvvəlcə onboarding qiymətləndirməsini tamamlayın.'}, status=400)

        serializer = ConnectionRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        psychologist = PsychologistProfile.objects.get(id=serializer.validated_data['psychologist_id'])

        if is_assigned(profile, psychologist):
            return Response({'detail': 'Bu psixoloq artıq sizə assign olunub.'}, status=400)

        if PatientConnectionRequest.objects.filter(
            patient=profile, psychologist=psychologist, status='pending'
        ).exists():
            return Response({'detail': 'Bu psixoloqa artıq aktiv müraciətiniz var.'}, status=400)

        req = PatientConnectionRequest.objects.create(
            patient=profile,
            psychologist=psychologist,
            message=serializer.validated_data.get('message', ''),
        )
        return Response(PatientConnectionRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class MyRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        requests_qs = PatientConnectionRequest.objects.filter(
            patient=request.user.patient_profile
        ).select_related('psychologist__user').order_by('-created_at')
        return Response(PatientConnectionRequestSerializer(requests_qs, many=True).data)


class MyPsychologistsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        from apps.users.models import PatientPsychologistAssignment
        assignments = PatientPsychologistAssignment.objects.filter(
            patient=request.user.patient_profile, is_active=True
        ).select_related('psychologist__user')
        data = [
            {
                'id': str(a.psychologist.id),
                'full_name': a.psychologist.user.full_name,
                'specialization': a.psychologist.specialization,
                'session_price': a.psychologist.session_price,
                'assigned_at': a.assigned_at.isoformat(),
            }
            for a in assignments
        ]
        return Response(data)


class PendingRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        requests_qs = PatientConnectionRequest.objects.filter(
            psychologist=request.user.psychologist_profile,
            status='pending',
        ).select_related('patient__user', 'patient__assessment')
        return Response(PendingRequestDetailSerializer(requests_qs, many=True).data)


class RespondRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        serializer = ConnectionRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            req = PatientConnectionRequest.objects.select_related('patient').get(
                id=pk,
                psychologist=request.user.psychologist_profile,
                status='pending',
            )
        except PatientConnectionRequest.DoesNotExist:
            return Response({'detail': 'Müraciət tapılmadı.'}, status=404)

        req.status = serializer.validated_data['status']
        req.responded_at = timezone.now()
        req.save(update_fields=['status', 'responded_at'])

        if req.status == 'accepted':
            assign_patient_to_psychologist(req.patient, req.psychologist)
            patient = req.patient
            if not patient.therapy_start_date:
                patient.therapy_start_date = timezone.now().date()
                patient.save(update_fields=['therapy_start_date'])

        return Response(PatientConnectionRequestSerializer(req).data)
