from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.models import PsychologistProfile
from .models import OnboardingAssessment, PatientConnectionRequest
from .serializers import (
    OnboardingAssessmentSerializer,
    PatientConnectionRequestSerializer,
    ConnectionRequestCreateSerializer,
    ConnectionRespondSerializer,
)


class OnboardingStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        profile = request.user.patient_profile
        return Response({'onboarding_status': profile.onboarding_status})


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
        profile.onboarding_status = 'assessment_done'
        profile.save(update_fields=['onboarding_status'])
        return Response(serializer.data)


class OnboardingPsychologistsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        psychologists = PsychologistProfile.objects.select_related('user').filter(
            user__is_active=True, is_accepting_patients=True
        )
        data = [
            {
                'id': str(p.id),
                'full_name': p.user.full_name,
                'specialization': p.specialization,
                'bio': p.bio,
                'session_price': p.session_price,
                'experience_years': p.experience_years,
                'languages': p.languages,
            }
            for p in psychologists
        ]
        return Response(data)


class OnboardingRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'patient':
            return Response({'detail': 'Yalnız pasiyentlər üçün.'}, status=403)
        serializer = ConnectionRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = request.user.patient_profile
        psychologist = PsychologistProfile.objects.get(id=serializer.validated_data['psychologist_id'])

        if PatientConnectionRequest.objects.filter(
            patient=profile, psychologist=psychologist, status='pending'
        ).exists():
            return Response({'detail': 'Bu psixoloqa artıq müraciət göndərilib.'}, status=400)

        req = PatientConnectionRequest.objects.create(
            patient=profile,
            psychologist=psychologist,
            message=serializer.validated_data.get('message', ''),
        )
        profile.onboarding_status = 'psychologist_selected'
        profile.save(update_fields=['onboarding_status'])
        return Response(PatientConnectionRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class PendingRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'detail': 'Yalnız psixoloqlar üçün.'}, status=403)
        requests_qs = PatientConnectionRequest.objects.filter(
            psychologist=request.user.psychologist_profile,
            status='pending',
        ).select_related('patient__user')
        return Response(PatientConnectionRequestSerializer(requests_qs, many=True).data)


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

        patient = req.patient
        if req.status == 'accepted':
            patient.psychologist = req.psychologist
            patient.onboarding_status = 'completed'
            if not patient.therapy_start_date:
                patient.therapy_start_date = timezone.now().date()
            patient.save(update_fields=['psychologist', 'onboarding_status', 'therapy_start_date'])
            PatientConnectionRequest.objects.filter(
                patient=patient, status='pending'
            ).exclude(id=req.id).update(status='rejected', responded_at=timezone.now())

        return Response(PatientConnectionRequestSerializer(req).data)
