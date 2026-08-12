from django.contrib import admin
from .models import Note, CheckIn, Notification


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'psychologist', 'is_private', 'created_at']
    list_filter = ['is_private']
    search_fields = ['title', 'patient__user__full_name']


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ['patient', 'mood_score', 'energy_level', 'anxiety_level', 'sleep_hours', 'created_at']
    list_filter = ['mood_score']
    search_fields = ['patient__user__full_name']
    date_hierarchy = 'created_at'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['title', 'user__full_name']
