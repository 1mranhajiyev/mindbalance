from apps.audit.models import AuditLog


def log_action(request, action, resource=None, resource_id=None):
    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
    )
