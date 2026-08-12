from django.contrib import admin
from .models import TherapySession, Task, Goal, Milestone


@admin.register(TherapySession)
class TherapySessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'psychologist', 'scheduled_at', 'status', 'format', 'is_paid']
    list_filter = ['status', 'format', 'is_paid']
    search_fields = ['patient__user__full_name', 'psychologist__user__full_name']
    date_hierarchy = 'scheduled_at'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'is_completed', 'due_date', 'created_at']
    list_filter = ['is_completed']
    search_fields = ['title', 'patient__user__full_name']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'psychologist', 'is_achieved', 'target_date']
    list_filter = ['is_achieved']
    search_fields = ['title', 'patient__user__full_name']


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'goal', 'is_completed', 'completed_at']
    list_filter = ['is_completed']
