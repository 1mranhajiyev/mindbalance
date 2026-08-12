# MindBalance

**Sənin rifahın, bizim prioritetimiz**

Psixoloq və pasiyent üçün vahid rəqəmsal terapiya platforması.

## Tech Stack

| Hissə | Texnologiya |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT + 2FA (TOTP) |
| Video | WebRTC |
| Styling | Tailwind CSS |

## Quraşdırma

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # test məlumatları
python manage.py runserver 0.0.0.0:8001

# Frontend
cd frontend
npm install
npm run dev -- -p 3002
```

## API

- Swagger: `http://localhost:8001/docs/`
- Base URL: `http://localhost:8001/api/v1/`

Test hesabları (seed): `SecurePass1!`
