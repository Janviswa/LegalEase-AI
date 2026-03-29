# ⚖️ LegalEase AI

**AI-powered legal document analysis, drafting, and management platform for Indian law.**

LegalEase AI helps individuals and legal professionals instantly analyze contracts, draft legal documents, and understand their rights — all powered by Groq's LLaMA 3.1 model. Upload a PDF, get a structured risk analysis, chat with the document, and export a professional report in seconds.

🌐 **Live App:** [legalease-ai-app.vercel.app](https://legalease-ai-app.vercel.app)  
🎥 **Demo Video:** [Watch on YouTube](https://www.youtube.com/your-video-link)

---

## ✨ Features

- 📄 **Document Analysis** — Upload PDF/DOCX legal documents and get AI-generated risk assessments, clause breakdowns, red flags, and fairness scores
- 🧠 **Analysis Depth Levels** — Choose Standard, Detailed, or Expert analysis depth
- 💬 **Chat with Document** — Ask follow-up questions about any uploaded document in a contextual chat
- 📝 **Legal Document Drafting** — Generate rent agreements, NDAs, employment contracts, and more with AI assistance
- 📊 **Export Reports** — Download analysis as a formatted PDF or DOCX report
- 🔐 **Authentication** — JWT-based sign up, login, password reset via email OTP
- 📚 **History** — View, star, and manage past analyses and drafted documents
- 📧 **Email Notifications** — Password reset and signing request emails via SMTP
- 🖊️ **Send for Signing** — Request document signatures via email

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Groq (LLaMA 3.1) | AI document analysis |
| pdfplumber | PDF text extraction |
| python-docx | DOCX generation |
| ReportLab | PDF report generation |
| Supabase | PostgreSQL database + auth |
| python-dotenv | Environment config |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Supabase | Database (PostgreSQL) |

---

## 🗄️ Database Schema (Supabase)

```sql
-- Users
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  name       TEXT,
  email      TEXT UNIQUE,
  hashed_pw  TEXT,
  plan       TEXT,
  created_at TEXT
);

-- Password reset tokens
CREATE TABLE reset_tokens (
  token      TEXT PRIMARY KEY,
  email      TEXT,
  expires_at TEXT
);

-- Analysis history
CREATE TABLE analysis_history (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  ...
);

-- Draft history
CREATE TABLE draft_history (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  ...
);
```

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/change-password` | Change password |
| `POST` | `/auth/forgot-password` | Send reset email |
| `POST` | `/auth/reset-password` | Reset password with token |
| `POST` | `/auth/update-profile` | Update display name |
| `POST` | `/analyze-document` | Upload & analyze a legal document |
| `POST` | `/chat` | Chat with an uploaded document |
| `POST` | `/export-report` | Export analysis as PDF |
| `POST` | `/export-doc-pdf` | Export drafted doc as PDF |
| `POST` | `/export-doc-docx` | Export drafted doc as DOCX |
| `POST` | `/analyse-draft` | AI review of a drafted document |
| `POST` | `/send-sign-request` | Email a signing request |
| `GET` | `/history/analysis` | Fetch analysis history |
| `POST` | `/history/analysis` | Save analysis to history |
| `PATCH` | `/history/analysis/{id}/star` | Star/unstar analysis |
| `DELETE` | `/history/analysis/{id}` | Delete analysis entry |
| `GET` | `/history/drafts` | Fetch draft history |
| `POST` | `/history/drafts` | Save draft to history |
| `PATCH` | `/history/drafts/{id}/star` | Star/unstar draft |
| `DELETE` | `/history/drafts/{id}` | Delete draft entry |
| `DELETE` | `/history/all` | Clear all history |

Full interactive docs available at `/docs` (Swagger UI).

---

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key
- A Gmail account with App Password for SMTP

### 1. Clone the repo

```bash
git clone https://github.com/your-username/LegalEase-AI.git
cd LegalEase-AI
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env.local`:

```env
GROQ_API_KEY=your_groq_api_key

JWT_SECRET=your_random_jwt_secret
PW_SALT=your_random_password_salt

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password

APP_URL=http://localhost:3000

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Start the backend:

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_BASE=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
# App running at http://localhost:3000
```

---

## ☁️ Deployment

### Backend → Railway

1. Push the `backend/` folder to a GitHub repo
2. Create a new Railway project → connect the repo
3. Add all environment variables from `.env.local` in Railway → **Variables**
4. Railway auto-detects `uvicorn` from `requirements.txt` and deploys

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable:
   ```
   VITE_API_BASE = https://your-railway-app.up.railway.app
   ```
   ⚠️ **No trailing slash** on the URL
4. Vercel auto-builds with `npm run build`

---

## 🔑 Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `GROQ_API_KEY` | Backend | Groq API key for LLaMA 3.1 |
| `JWT_SECRET` | Backend | Secret for signing JWT tokens |
| `PW_SALT` | Backend | Salt for password hashing |
| `SMTP_HOST` | Backend | SMTP server (e.g. smtp.gmail.com) |
| `SMTP_PORT` | Backend | SMTP port (587) |
| `SMTP_USER` | Backend | Sender email address |
| `SMTP_PASSWORD` | Backend | Gmail App Password |
| `APP_URL` | Backend | Frontend URL for email links |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Backend | Supabase service role key (keep secret!) |
| `VITE_API_BASE` | Frontend | Railway backend URL (no trailing slash) |

---

## 📁 Project Structure

```
LegalEase AI/
├── backend/
│   ├── main.py              # FastAPI app & all routes
│   ├── auth.py              # JWT auth + Supabase user management
│   ├── groq_client.py       # Groq LLaMA 3.1 integration
│   ├── email_service.py     # SMTP email sending
│   ├── requirements.txt
│   └── .env.local           # (not committed)
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── theme.js          # API_BASE + color tokens
    │   └── components/
    │       ├── AnalyzePage.jsx
    │       ├── DraftPage.jsx
    │       ├── ChatWidget.jsx
    │       ├── HistoryPage.jsx
    │       ├── LoginModal.jsx
    │       ├── SettingsPage.jsx
    │       └── ...
    ├── package.json
    └── .env.local            # (not committed)
```

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast LLaMA 3.1 inference
- [Supabase](https://supabase.com) — Open source Firebase alternative
- [FastAPI](https://fastapi.tiangolo.com) — Modern Python API framework
- [Vercel](https://vercel.com) & [Railway](https://railway.app) — Hosting platforms

---

> Built with ❤️ for making legal documents accessible to everyone.

---

## 🌟 Support

If you found this project helpful, please consider giving it a ⭐ star on GitHub — it means a lot and helps others discover the project!

[![GitHub stars](https://img.shields.io/github/stars/Janviswa/LegalEase-AI?style=social)](https://github.com/Janviswa/LegalEase-AI)

---

## 👩‍💻 Author

**Janani V**

[![GitHub](https://img.shields.io/badge/GitHub-Janviswa-181717?style=for-the-badge&logo=github)](https://github.com/Janviswa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Janani%20V-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/janani-v)
