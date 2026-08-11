# 🧠 MindBalance

**Sənin rifahın, bizim prioritetimiz**

MindBalance — psixoloq və pasiyent üçün vahid rəqəmsal terapiya platforması. Hisslər, düşüncələr, seanslar, tapşırıqlar, inkişaf izləmə və daha çox — hamısı bir yerdə.

---

## 📌 Layihə haqqında

Bu platforma pasiyentin terapiyaya başladığı ilk gündən etibarən:
- Terapiyaya müraciət səbəbini
- Emosional vəziyyətini (0–10 şkala)
- Düşüncə və davranış nümunələrini
- Terapiya məqsədlərini
- Seans tarixçəsini
- Zamanla baş verən dəyişiklikləri

bir sistemdə toplayır və həm pasiyentə, həm psixoloqa prosesi sistemli şəkildə izləmək imkanı yaradır.

---

## 🛠️ Tech Stack

| Hissə | Texnologiya |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | JWT + 2FA |
| Video görüş | WebRTC (tətbiq daxili) |
| Styling | Tailwind CSS |
| State | Zustand |
| ORM | SQLAlchemy + Alembic |

---

## 👥 İstifadəçi rolları

### 🙍 Pasiyent
- Gündəlik emosional check-in (0–10 şkala)
- Düşüncə və hiss qeydləri
- Şəxsi gündəlik
- Ev tapşırıqları
- Terapiya məqsədlərini izləmə
- Seans planı və video görüş
- İnkişaf qrafikləri
- "Əvvəlki mən — İndiki mən" müqayisəsi
- Terapiya xəritəsi (timeline)
- Mənim uğurlarım

### 🧑‍⚕️ Psixoloq
- Pasiyentlər siyahısı və profili
- Seans planlaşdırma (online / offline)
- Terapiya qeydləri
- Ev tapşırığı yaratma
- Material göndərmə (PDF, audio, video)
- CBT / Schema Therapy alətləri
- İnkişaf statistikası
- Ödəniş və gəlir dashboardu

---

## 📁 Layihə strukturu

```
mindbalance/
├── frontend/          # Next.js tətbiqi
│   ├── app/
│   │   ├── (auth)/    # Login, Register
│   │   ├── patient/   # Pasiyent səhifələri
│   │   └── psychologist/ # Psixoloq paneli
│   ├── components/
│   ├── hooks/
│   ├── store/         # Zustand state
│   └── lib/
├── backend/           # FastAPI tətbiqi
│   ├── app/
│   │   ├── api/       # Route-lar
│   │   ├── models/    # SQLAlchemy modellər
│   │   ├── schemas/   # Pydantic sxemlər
│   │   ├── services/  # Business logic
│   │   └── core/      # Config, security
│   ├── alembic/       # DB mirasiyaları
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## 🔒 Təhlükəsizlik

- 256-bit məlumat şifrələməsi
- İki mərhəli doğrulama (2FA)
- JWT token əsaslı auth
- Rol əsaslı giriş nəzarəti (RBAC)
- Audit loglama
- Video görüşün qeyd edilməsi qadağandır
- Pasiyent məlumatları yalnız ona aid psixoloqa görünür

---

## 🚀 MVP Funksiyaları (v1.0)

- [x] Repo yaradılıb
- [ ] Auth sistemi (JWT + 2FA)
- [ ] Pasiyent dashboardu
- [ ] Psixoloq dashboardu
- [ ] Gündəlik emosional check-in
- [ ] Düşüncə izləmə
- [ ] Tapşırıq sistemi
- [ ] Seans planlaşdırma
- [ ] Tətbiq daxili video görüş (WebRTC)
- [ ] İnkişaf qrafiklərı
- [ ] Terapiya xəritəsi (timeline)
- [ ] Ödəniş sistemi
- [ ] Məxfilik və təhlükəsizlik sistemi

---

## ⚙️ Quraşdırma

```bash
# Repo klonla
git clone https://github.com/1mranhajiyev/mindbalance.git
cd mindbalance

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📄 Lisenziya

Bu layihə xüsusi (private) lisenziya altındadır. İcazəsiz istifadə qadağandır.
