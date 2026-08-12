CALL_STATE_SCHEDULED = 'scheduled'
CALL_STATE_PATIENT_WAITING = 'patient_waiting'
CALL_STATE_PSYCHOLOGIST_WAITING = 'psychologist_waiting'
CALL_STATE_ACTIVE = 'active'
CALL_STATE_COMPLETED = 'completed'


def sync_call_state(session):
    if session.status == 'completed':
        session.call_state = CALL_STATE_COMPLETED
        session.patient_in_call = False
        session.psychologist_in_call = False
        session.call_had_both = False
    elif session.patient_in_call and session.psychologist_in_call:
        session.call_state = CALL_STATE_ACTIVE
    elif session.patient_in_call:
        session.call_state = CALL_STATE_PATIENT_WAITING
    elif session.psychologist_in_call:
        session.call_state = CALL_STATE_PSYCHOLOGIST_WAITING
    else:
        session.call_state = CALL_STATE_SCHEDULED
    return session
