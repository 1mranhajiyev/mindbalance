from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource', 'resource_id', 'ip_address', 'created_at']
    list_filter = ['action', 'resource']
    search_fields = ['user__full_name', 'action', 'resource_id']
    date_hierarchy = 'created_at'
    readonly_fields = ['id', 'created_at']
