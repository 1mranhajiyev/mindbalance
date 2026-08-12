from apps.users.models import PatientProfile, PsychologistProfile, PatientPsychologistAssignment


def get_assigned_patients(psychologist: PsychologistProfile):
    return PatientProfile.objects.filter(
        psychologist_assignments__psychologist=psychologist,
        psychologist_assignments__is_active=True,
    ).select_related('user').distinct()


def get_assigned_psychologists(patient: PatientProfile):
    return PsychologistProfile.objects.filter(
        patient_assignments__patient=patient,
        patient_assignments__is_active=True,
    ).select_related('user').distinct()


def is_assigned(patient: PatientProfile, psychologist: PsychologistProfile) -> bool:
    return PatientPsychologistAssignment.objects.filter(
        patient=patient,
        psychologist=psychologist,
        is_active=True,
    ).exists()


def assign_patient_to_psychologist(patient: PatientProfile, psychologist: PsychologistProfile):
    assignment, created = PatientPsychologistAssignment.objects.get_or_create(
        patient=patient,
        psychologist=psychologist,
        defaults={'is_active': True},
    )
    if not assignment.is_active:
        assignment.is_active = True
        assignment.save(update_fields=['is_active'])
    return assignment


def get_assigned_patient_or_404(patient_id, psychologist: PsychologistProfile) -> PatientProfile:
    return get_assigned_patients(psychologist).get(id=patient_id)
