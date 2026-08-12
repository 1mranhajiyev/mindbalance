#!/usr/bin/env python
"""API endpoint smoke tests."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from apps.users.models import User

client = APIClient()
BASE = '/api/v1'

def login(email):
    user = User.objects.get(email=email)
    client.force_authenticate(user=user)
    return user

def test(name, method, url, data=None, expected=(200, 201)):
    fn = getattr(client, method.lower())
    kwargs = {'format': 'json'}
    if data is not None:
        resp = fn(url, data, **kwargs)
    else:
        resp = fn(url, **kwargs)
    ok = resp.status_code in expected
    status = 'OK' if ok else 'FAIL'
    print(f'  [{status}] {name}: {resp.status_code}')
    if not ok:
        print(f'         {getattr(resp, "data", resp.content[:200])}')
    return ok

print('=== MindBalance API Tests ===\n')

# Psychologist tests
login('leyla.psixoloq@mindbalance.az')
print('Psixoloq (Leyla):')
all_ok = True
all_ok &= test('Dashboard', 'get', f'{BASE}/psychologists/dashboard/')
all_ok &= test('Statistics', 'get', f'{BASE}/psychologist/statistics/')
all_ok &= test('Payments', 'get', f'{BASE}/payments/')
all_ok &= test('Patients list', 'get', f'{BASE}/patients/')
all_ok &= test('Sessions list', 'get', f'{BASE}/sessions/')
all_ok &= test('Tasks list', 'get', f'{BASE}/tasks/')
all_ok &= test('Goals list', 'get', f'{BASE}/goals/')
all_ok &= test('Notes list', 'get', f'{BASE}/notes/')
all_ok &= test('Pending requests', 'get', f'{BASE}/onboarding/pending-requests/')

# Patient tests
login('ayse.pasient@mindbalance.az')
print('\nPasiyent (Ayşə):')
all_ok &= test('Onboarding status', 'get', f'{BASE}/onboarding/status/')
all_ok &= test('Sessions list', 'get', f'{BASE}/sessions/')
all_ok &= test('Tasks list', 'get', f'{BASE}/tasks/')
all_ok &= test('Goals list', 'get', f'{BASE}/goals/')
all_ok &= test('Checkins list', 'get', f'{BASE}/checkins/')
all_ok &= test('Journal list', 'get', f'{BASE}/notes/journal/')

# CRUD tests
all_ok &= test('Create checkin', 'post', f'{BASE}/checkins/', {
    'emotion': 'sakit', 'intensity': 6, 'cause': 'Test', 'checkin_type': 'daily'
}, expected=(201,))
all_ok &= test('Create journal', 'post', f'{BASE}/notes/journal/', {
    'content': 'Test gündəlik qeydi', 'emotion': 'xoşbəxt', 'event': 'Test'
}, expected=(201,))

tasks = client.get(f'{BASE}/tasks/').data
if tasks:
    task_id = tasks[0]['id']
    all_ok &= test('Complete task', 'post', f'{BASE}/tasks/{task_id}/complete/', expected=(200,))

# New patient onboarding flow
login('kamran.pasient@mindbalance.az')
print('\nPasiyent onboarding (Kamran):')
all_ok &= test('Assessment POST', 'post', f'{BASE}/onboarding/assessment/', {
    'therapy_reason': 'Stress', 'main_concern': 'İş', 'anxiety_score': 7
})
all_ok &= test('Psychologists list', 'get', f'{BASE}/onboarding/psychologists/')
psychs = client.get(f'{BASE}/onboarding/psychologists/').data
if psychs:
    all_ok &= test('Send request', 'post', f'{BASE}/onboarding/request/', {
        'psychologist_id': psychs[0]['id'], 'message': 'Salam'
    }, expected=(201,))

print('\n' + ('=== Bütün testlər KEÇDİ ===' if all_ok else '=== Bəzi testlər UĞURSUZ ==='))
