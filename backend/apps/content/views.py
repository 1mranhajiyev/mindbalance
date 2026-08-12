from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note, CheckIn
from .serializers import NoteSerializer, CheckInSerializer


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        note_type = self.request.query_params.get('note_type')
        qs = Note.objects.all()
        if note_type:
            qs = qs.filter(note_type=note_type)
        if user.role == 'psychologist':
            return qs.filter(psychologist__user=user).select_related('patient__user')
        return qs.filter(patient__user=user, is_private=True).select_related('patient__user')

    def perform_create(self, serializer):
        user = self.request.user
        content = self.request.data.get('content', '')
        title = self.request.data.get('title') or (content[:50] if content else 'Qeyd')
        if user.role == 'psychologist':
            from apps.users.models import PatientProfile
            patient_id = self.request.data.get('patient_id')
            patient = None
            if patient_id:
                patient = PatientProfile.objects.get(
                    id=patient_id, psychologist=user.psychologist_profile
                )
            serializer.save(
                psychologist=user.psychologist_profile,
                patient=patient,
                title=title,
                note_type=self.request.data.get('note_type', 'clinical'),
            )
        else:
            serializer.save(
                patient=user.patient_profile,
                title=title,
                note_type='journal',
                is_private=True,
            )

    @action(detail=False, methods=['get', 'post'], url_path='journal')
    def journal(self, request):
        if request.method == 'GET':
            notes = Note.objects.filter(
                patient__user=request.user, note_type='journal', is_private=True
            ).order_by('-created_at')
            return Response(NoteSerializer(notes, many=True).data)
        content = request.data.get('content', '')
        title = content[:50] if content else 'Gündəlik'
        note = Note.objects.create(
            patient=request.user.patient_profile,
            title=title,
            content=content,
            emotion=request.data.get('emotion'),
            event=request.data.get('event'),
            note_type='journal',
            is_private=True,
        )
        return Response(NoteSerializer(note).data, status=201)


class CheckInViewSet(viewsets.ModelViewSet):
    serializer_class = CheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CheckIn.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        intensity = serializer.validated_data.get('intensity')
        serializer.save(
            patient=self.request.user.patient_profile,
            mood_score=intensity or serializer.validated_data.get('mood_score', 5),
        )
