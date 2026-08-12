from rest_framework import serializers
from .models import TherapySession, Task, Goal, Milestone


class TherapySessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    psychologist_name = serializers.CharField(source='psychologist.user.full_name', read_only=True)

    class Meta:
        model = TherapySession
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['patient', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    milestones = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['patient', 'created_at', 'updated_at']

    def get_milestones(self, obj):
        return MilestoneSerializer(obj.milestones.all(), many=True).data


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'
