# ⚖ Legal Bro — AI Legal Document Drafter

AI-powered legal document drafting tool built with React + Vite (frontend) and Django REST Framework (backend), using Anthropic Claude for AI generation and Supabase for auth + database.

---

## 📁 Folder Structure

```
legalbro/
├── frontend/                  # React + Vite app (deploy to Vercel)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Hero, features, doc type chips
│   │   │   ├── Draft.jsx      # 3-step AI drafter
│   │   │   ├── Login.jsx      # Supabase email + Google auth
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx  # Saved documents list
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AuthContext.jsx
│   │   └── lib/
│   │       ├── supabaseClient.js
│   │       ├── api.js          # Django API calls
│   │       └── docTypes.js     # All 20+ document type definitions
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   └── package.json
│
└── backend/                   # Django REST Framework (deploy to Railway)
    ├── config/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── documents/
    │   ├── models.py           # Document model
    │   ├── views.py            # Generate, List, Detail, RateLimit views
    │   ├── serializers.py
    │   ├── urls.py
    │   ├── auth.py             # Supabase JWT authentication
    │   ├── prompts.py          # Claude prompt builder
    │   └── migrations/
    ├── manage.py
    ├── requirements.txt
    ├── Procfile
    └── .env.example
```

---

## 🚀 Local Development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your keys
python3 manage.py migrate
python3 manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env            # Fill in your Supabase + API keys
npm run dev
```

---

## 🛠 Environment Variables

### Backend (`backend/.env`)

```
SECRET_KEY=your-django-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend.railway.app,localhost

ANTHROPIC_API_KEY=sk-ant-...

DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=https://your-backend.railway.app
```

---

## ☁️ Deployment

### 1. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
   - `JWT Secret` → `SUPABASE_JWT_SECRET` (backend)
3. Go to **Project Settings → Database** and copy the connection string → `DATABASE_URL`
4. Enable **Google OAuth** under **Authentication → Providers** if needed

### 2. Deploy Backend to Railway
1. Push `backend/` to a GitHub repo
2. Create a new Railway project → **Deploy from GitHub**
3. Set all backend env vars in Railway dashboard
4. Railway auto-detects the `Procfile`:
   ```
   web: gunicorn config.wsgi --workers 2 --bind 0.0.0.0:$PORT
   ```
5. Open a Railway shell and run:
   ```bash
   python manage.py migrate
   ```
6. Copy your Railway deployment URL → use as `VITE_API_BASE_URL`

### 3. Deploy Frontend to Vercel
1. Push `frontend/` to GitHub (or the whole monorepo)
2. Import project in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set all `VITE_*` environment variables in Vercel dashboard
5. Vercel auto-builds with `npm run build` and serves `dist/`
6. `vercel.json` handles SPA routing (all paths → `index.html`)

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/generate/` | Generate AI document | Required |
| GET | `/api/documents/` | List user's documents | Required |
| GET | `/api/documents/<id>/` | Get single document | Required |
| DELETE | `/api/documents/<id>/` | Delete document | Required |
| GET | `/api/rate-limit/` | Check daily usage | Required |

### POST `/api/generate/` body:
```json
{
  "doc_type": "nda",
  "doc_type_label": "Non-Disclosure Agreement",
  "fields": {
    "disclosing": "Acme Corp",
    "receiving": "Beta LLC",
    "purpose": "Exploring a potential business partnership",
    "duration": "2 years",
    "jurisdiction": "Delhi, India"
  }
}
```

---

## 📄 Document Types

### Core Legal (6)
- NDA, MOU, Service Agreement, Rent Agreement, Employment Letter, Partnership Deed

### Business & Corporate (5)
- Freelancer Contract, Vendor Agreement, Consultancy Agreement, Share Purchase Agreement, Term Sheet

### Employment & HR (5)
- Internship Agreement, Non-Compete Agreement, Termination Letter, Experience Letter, Relieving Letter

---

## ⚙️ Features

- **20+ document types** across 3 categories
- **3-step drafter UI** with animated transitions (framer-motion)
- **Rate limiting** — 10 documents per user per day
- **Supabase Auth** — email/password + Google OAuth
- **JWT validation** — all backend routes protected via Supabase JWT
- **PDF download** — jsPDF in browser
- **Dashboard** — view, download, delete saved documents
- **CORS configured** for Vercel → Railway communication
- **Mobile-first** — fully responsive

---

## 📝 Notes

- Documents are AI-generated using `claude-sonnet-4-20250514` and should be reviewed by a qualified legal professional before use.
- The standalone `legal-bro-app.html` file is a fully self-contained demo version that works without any backend — it calls the Anthropic API directly from the browser and stores documents in `localStorage`.
