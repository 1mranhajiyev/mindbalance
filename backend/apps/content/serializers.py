from rest_framework import serializers
from .models import Note, CheckIn, Notification


class NoteSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Note
        fields = [
            'id', 'patient', 'patient_id', 'patient_name', 'psychologist', 'title',
            'content', 'emotion', 'event', 'note_type', 'is_private', 'created_at', 'updated_at',
        ]
        read_only_fields = ['patient', 'patient_name', 'psychologist', 'created_at', 'updated_at']


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = [
            'id', 'patient', 'mood_score', 'emotion', 'intensity', 'cause', 'checkin_type',
            'energy_level', 'anxiety_level', 'sleep_hours', 'note', 'created_at',
        ]
        read_only_fields = ['patient', 'created_at']

    def validate(self, attrs):
        intensity = attrs.get('intensity')
        if intensity is not None:
            attrs['mood_score'] = intensity
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
