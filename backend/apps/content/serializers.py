from rest_framework import serializers
from .models import Note, CheckIn, Notification, ThoughtRecord, Material, PatientMaterial


class NoteSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True, allow_null=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Note
        fields = [
            'id', 'patient', 'patient_id', 'patient_name', 'psychologist', 'session',
            'title', 'content', 'emotion', 'event', 'note_type', 'is_private',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['patient', 'patient_name', 'psychologist', 'created_at', 'updated_at']


class CheckInSerializer(serializers.ModelSerializer):
    session_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = CheckIn
        fields = [
            'id', 'patient', 'session', 'session_id', 'mood_score', 'emotion', 'intensity',
            'cause', 'checkin_type', 'energy_level', 'anxiety_level', 'sleep_hours',
            'note', 'created_at',
        ]
        read_only_fields = ['patient', 'session', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class ThoughtRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThoughtRecord
        fields = [
            'id', 'patient', 'situation', 'automatic_thought', 'emotion', 'intensity',
            'alternative_thought', 'cognitive_distortion', 'created_at',
        ]
        read_only_fields = ['patient', 'created_at']


class MaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'psychologist', 'title', 'description', 'file', 'file_url',
            'file_type', 'created_at',
        ]
        read_only_fields = ['psychologist', 'file_url', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class PatientMaterialSerializer(serializers.ModelSerializer):
    material_title = serializers.CharField(source='material.title', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_type = serializers.CharField(source='material.file_type', read_only=True)

    class Meta:
        model = PatientMaterial
        fields = [
            'id', 'patient', 'material', 'material_title', 'sent_by', 'is_read',
            'sent_at', 'file_url', 'file_type',
        ]
        read_only_fields = ['patient', 'sent_by', 'sent_at', 'material_title', 'file_url', 'file_type']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.material.file and request:
            return request.build_absolute_uri(obj.material.file.url)
        return obj.material.file.url if obj.material.file else None
