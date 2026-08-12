from datetime import timedelta

from django.utils import timezone


def reconcile_call_state(session):
    """DB-də qalmış köhnə call flag-larını düzəlt."""
    update_fields = []

    if session.status == 'completed':
        for field in ('patient_in_call', 'psychologist_in_call', 'call_had_both'):
            if getattr(session, field):
                setattr(session, field, False)
                update_fields.append(field)
    elif session.patient_in_call or session.psychologist_in_call:
        last_signal = session.webrtc_signals.order_by('-created_at').first()
        if last_signal:
            stale = timezone.now() - last_signal.created_at > timedelta(seconds=45)
        elif session.started_at:
            stale = timezone.now() - session.started_at > timedelta(minutes=2)
        else:
            stale = False

        if stale:
            session.patient_in_call = False
            session.psychologist_in_call = False
            update_fields.extend(['patient_in_call', 'psychologist_in_call'])
            if session.call_had_both:
                session.status = 'completed'
                session.ended_at = session.ended_at or timezone.now()
                session.call_had_both = False
                update_fields.extend(['status', 'ended_at', 'call_had_both'])
    elif session.call_had_both and session.status != 'completed':
        session.status = 'completed'
        session.ended_at = session.ended_at or timezone.now()
        session.call_had_both = False
        update_fields.extend(['status', 'ended_at', 'call_had_both'])

    if update_fields:
        session.save(update_fields=list(dict.fromkeys(update_fields)))

    return session


def get_call_state(session):
    session = reconcile_call_state(session)

    if session.status == 'completed':
        return 'completed'
    if session.status == 'cancelled':
        return 'cancelled'

    in_call = []
    if session.patient_in_call:
        in_call.append('patient')
    if session.psychologist_in_call:
        in_call.append('psychologist')

    if not in_call:
        return 'scheduled'
    if len(in_call) >= 2:
        return 'active'
    if 'patient' in in_call:
        return 'patient_waiting'
    if 'psychologist' in in_call:
        return 'psychologist_waiting'
    return 'scheduled'
