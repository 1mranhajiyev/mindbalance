#!/usr/bin/env python3
"""Live API smoke tests against running server."""
import json
import sys
import urllib.request
import urllib.error

BASE = 'http://localhost:8001/api/v1'


def request(method, path, token=None, data=None):
    url = f'{BASE}{path}'
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = raw[:300]
        return e.code, payload


def login(email, password='SecurePass1!'):
    status, data = request('POST', '/auth/login/', data={'email': email, 'password': password})
    if status != 200:
        raise RuntimeError(f'Login failed for {email}: {status} {data}')
    return data['access']


def test(name, method, path, token, data=None, expected=(200, 201)):
    status, payload = request(method, path, token, data)
    ok = status in expected
    print(f"  [{'OK' if ok else 'FAIL'}] {name}: {status}")
    if not ok:
        print(f'         {payload}')
    return ok


def main():
    print('=== MindBalance Live API Tests ===\n')
    all_ok = True

    psych_token = login('leyla.psixoloq@mindbalance.az')
    print('Psixoloq (Leyla):')
    for name, path in [
        ('Dashboard', '/psychologists/dashboard/'),
        ('Statistics', '/psychologist/statistics/'),
        ('Payments', '/payments/'),
        ('Patients', '/patients/'),
        ('Sessions', '/sessions/'),
        ('Tasks', '/tasks/'),
        ('Goals', '/goals/'),
        ('Notes', '/notes/'),
        ('Pending requests', '/onboarding/pending-requests/'),
        ('Wellness timeline', '/wellness/timeline/'),
        ('Materials', '/materials/'),
    ]:
        all_ok &= test(name, 'GET', path, psych_token)

    patient_token = login('ayse.pasient@mindbalance.az')
    print('\nPasiyent (Ayşə):')
    for name, path in [
        ('Onboarding status', '/onboarding/status/'),
        ('Sessions', '/sessions/'),
        ('Tasks', '/tasks/'),
        ('Goals', '/goals/'),
        ('Checkins', '/checkins/'),
        ('Journal', '/notes/journal/'),
    ]:
        all_ok &= test(name, 'GET', path, patient_token)

    all_ok &= test('Create checkin', 'POST', '/checkins/', patient_token, {
        'emotion': 'sakit', 'intensity': 6, 'cause': 'Test', 'checkin_type': 'daily'
    })
    all_ok &= test('Create journal', 'POST', '/notes/journal/', patient_token, {
        'content': 'Test qeyd', 'emotion': 'xoşbəxt', 'event': 'Test'
    })
    all_ok &= test('Thoughts list', 'GET', '/thoughts/', patient_token)
    all_ok &= test('Timeline', 'GET', '/wellness/timeline/', patient_token)
    all_ok &= test('Achievements', 'GET', '/wellness/achievements/', patient_token)
    all_ok &= test('Notifications', 'GET', '/notifications/', patient_token)
    all_ok &= test('Patient materials', 'GET', '/patient-materials/', patient_token)
    all_ok &= test('Progress comparison', 'GET', '/progress/comparison/', patient_token, expected=(200, 404))
    all_ok &= test('Create thought', 'POST', '/thoughts/', patient_token, {
        'situation': 'Test', 'automatic_thought': 'Test', 'emotion': 'narahat', 'intensity': 5
    }, expected=(201,))

    _, tasks = request('GET', '/tasks/', patient_token)
    if isinstance(tasks, list) and tasks:
        incomplete = next((t for t in tasks if not t.get('is_completed')), None)
        if incomplete:
            all_ok &= test('Complete task', 'POST', f"/tasks/{incomplete['id']}/complete/", patient_token)

    kamran_token = login('kamran.pasient@mindbalance.az')
    print('\nOnboarding (Kamran):')
    all_ok &= test('Assessment', 'POST', '/onboarding/assessment/', kamran_token, {
        'therapy_reason': 'Stress', 'main_concern': 'İş', 'anxiety_score': 7
    })
    _, psychs = request('GET', '/onboarding/psychologists/', kamran_token)
    if isinstance(psychs, list) and psychs:
        all_ok &= test('Send request', 'POST', '/onboarding/request/', kamran_token, {
            'psychologist_id': psychs[0]['id'], 'message': 'Salam'
        }, expected=(200, 201, 400))

    _, pending = request('GET', '/onboarding/pending-requests/', psych_token)
    if isinstance(pending, list) and pending:
        req_id = pending[0]['id']
        all_ok &= test('Accept request', 'POST', f'/onboarding/respond/{req_id}/', psych_token, {'status': 'accepted'})

    print('\n' + ('=== Bütün testlər KEÇDİ ===' if all_ok else '=== Bəzi testlər UĞURSUZ ==='))
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
