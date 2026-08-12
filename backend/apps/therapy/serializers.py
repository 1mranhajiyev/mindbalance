from rest_framework import serializers
from .models import (
    TherapySession, Task, Goal, Milestone, GoalProgressLog,
    TherapyTimelineEvent, PatientAchievement, TherapyLearning,
)


class TherapySessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    psychologist_name = serializers.CharField(source='psychologist.user.full_name', read_only=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)
    psychologist_id = serializers.UUIDField(write_only=True, required=False)

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


class MilestoneSerializer(serializers.ModelSerializer):
    goal_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Milestone
        fields = ['id', 'goal', 'goal_id', 'title', 'is_completed', 'completed_at', 'created_at']
        read_only_fields = ['goal', 'created_at']


class GoalProgressLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalProgressLog
        fields = ['id', 'goal', 'score', 'note', 'created_at']
        read_only_fields = ['goal', 'created_at']


class GoalSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    progress_logs = GoalProgressLogSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Goal
        fields = [
            'id', 'patient', 'patient_id', 'psychologist', 'title', 'description',
            'is_achieved', 'initial_score', 'current_score', 'target_score', 'status',
            'target_date', 'milestones', 'progress_logs', 'created_at', 'updated_at',
        ]
        read_only_fields = ['patient', 'psychologist', 'created_at', 'updated_at']

    def get_status(self, obj):
        return 'completed' if obj.is_achieved else 'active'


class TherapyTimelineEventSerializer(serializers.ModelSerializer):
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = TherapyTimelineEvent
        fields = [
            'id', 'patient', 'patient_id', 'psychologist', 'title', 'description',
            'event_date', 'created_at',
        ]
        read_only_fields = ['patient', 'psychologist', 'created_at']


class PatientAchievementSerializer(serializers.ModelSerializer):
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = PatientAchievement
        fields = ['id', 'patient', 'patient_id', 'title', 'description', 'achieved_at', 'created_at']
        read_only_fields = ['patient', 'created_at']


class TherapyLearningSerializer(serializers.ModelSerializer):
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = TherapyLearning
        fields = ['id', 'patient', 'patient_id', 'session', 'title', 'content', 'created_at']
        read_only_fields = ['patient', 'created_at']
