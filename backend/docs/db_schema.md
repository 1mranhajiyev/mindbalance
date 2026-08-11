# MindBalance — Verilənbəza Sxemi

## Cədvəllər və əlaqələr

```
users
  ├── patient_profiles  (1:1)
  └── psychologist_profiles (1:1)

psychologist_profiles
  ├── patient_profiles[]    (1:N)  — psixoloqun pasiyentləri
  ├── therapy_sessions[]    (1:N)
  ├── therapy_notes[]       (1:N)
  ├── tasks[]               (1:N)
  └── materials[]           (1:N)

patient_profiles
  ├── checkins[]            (1:N)
  ├── goals[]               (1:N)
  │     └── goal_progress_logs[] (1:N)
  ├── therapy_sessions[]    (1:N)
  ├── tasks[]               (1:N)
  ├── journal_entries[]     (1:N)
  ├── therapy_milestones[]  (1:N)
  ├── patient_achievements[] (1:N)
  ├── therapy_learnings[]   (1:N)
  ├── patient_materials[]   (1:N)
  └── payments[]            (1:N)

therapy_sessions
  ├── therapy_notes[]       (1:N)
  ├── checkins[]            (1:N)  — pre/post seans check-in
  └── payments[]            (1:N)

users
  ├── notifications[]       (1:N)
  └── audit_logs[]          (1:N)
```

## Migrasiya sərası

| # | Fayl | Məzmun |
|---|---|---|
| 0001 | initial_schema | users, profillər, seanslar, check-inlər, məqsədlər, tapşırıqlar, qeydlər, gündəlik |
| 0002 | add_audit_log | audit_logs (təhlükəsizlik) |
| 0003 | add_notifications | notifications (xatırlatmalar) |
| 0004 | add_therapy_materials | materials, patient_materials |
| 0005 | add_payments | payments |
| 0006 | add_therapy_timeline | therapy_milestones, patient_achievements, therapy_learnings |

## İstifadə

```bash
cd backend

# Bütün migrasiyaları tətbiq et
alembic upgrade head

# Cari vəziyyəti yoxla
alembic current

# Tarixçəyə bax
alembic history

# Bir addım geri
alembic downgrade -1

# Tam sıfırla
alembic downgrade base

# Yeni migrasiya yarat
alembic revision --autogenerate -m "add new table"
```

## Cədvəl sayı: 18

| Cədvəl | Məqsəd |
|---|---|
| users | Bütün istifadəçilər (2 rol) |
| patient_profiles | Pasiyent profili |
| psychologist_profiles | Psixoloq profili |
| therapy_sessions | Seanslar + WebRTC room |
| checkins | Gündəlik emosional check-in |
| goals | Terapiya məqsədləri |
| goal_progress_logs | Məqsəd dəyişiklik tarixçəsi |
| tasks | Ev tapşırıqları |
| therapy_notes | Psixoloqun seans qeydləri |
| journal_entries | Pasiyentin şəxsi gündəliyi |
| materials | Psixoloqun material kitabxanası |
| patient_materials | Pasiyentə göndərilən materiallar |
| payments | Ödənişlər |
| notifications | Xatırlatmalar + bildirişlər |
| audit_logs | Giriş auditı (kim, nə vaxt, nə) |
| therapy_milestones | Terapiya xəritəsi (timeline) |
| patient_achievements | Pasiyentin uğurları |
| therapy_learnings | Terapiyada öyrənilənlər |
