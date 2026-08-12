from rest_framework import serializers
from .models import TherapySession, Task, Goal, Milestone
from .call_state import get_call_state


class TherapySessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    psychologist_name = serializers.CharField(source='psychologist.user.full_name', read_only=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)
    psychologist_id = serializers.UUIDField(write_only=True, required=False)
    call_state = serializers.SerializerMethodField()

    class Meta:
        model = TherapySession
        fields = [
            'id', 'patient', 'patient_id', 'patient_name', 'psychologist', 'psychologist_id',
            'psychologist_name', 'scheduled_at', 'duration_minutes', 'format', 'status',
            'call_state', 'started_at', 'ended_at', 'price', 'is_paid', 'webrtc_room_id', 'created_at',
        ]
        read_only_fields = [
            'patient', 'psychologist', 'patient_name', 'psychologist_name', 'call_state', 'created_at',
        ]

    def get_call_state(self, obj):
        return get_call_state(obj)


class TaskSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'session', 'patient', 'patient_id', 'patient_name', 'title', 'description',
            'is_completed', 'due_date', 'created_at', 'updated_at',
        ]
        read_only_fields = ['patient', 'patient_name', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    milestones = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Goal
        fields = [
            'id', 'patient', 'patient_id', 'psychologist', 'title', 'description',
            'is_achieved', 'initial_score', 'current_score', 'target_score', 'status',
            'target_date', 'milestones', 'created_at', 'updated_at',
        ]
        read_only_fields = ['patient', 'psychologist', 'created_at', 'updated_at']

    def get_milestones(self, obj):
        return MilestoneSerializer(obj.milestones.all(), many=True).data

    def get_status(self, obj):
        return 'completed' if obj.is_achieved else 'active'


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'
