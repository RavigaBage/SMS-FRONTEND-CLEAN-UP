
# School Management System

A comprehensive school management platform for academic and administrative operations.

---

## Overview

A modern full-stack web application built with a **Next.js frontend** and **Django REST Framework backend**.

The platform streamlines:

* Student records
* Academic management
* Financial tracking
* Attendance monitoring
* Internal communication

Designed for performance, scalability, and maintainability.

---

## Tech Stack

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend    | Django, Django REST Framework                  |
| Database   | SQLite (Development) / PostgreSQL (Production) |
| Charts     | Chart.js                                       |
| Deployment | Docker, GitHub Actions, VPS                    |

---

## Project Structure

```
├── frontend/              # Next.js App Router application
│   ├── src/
│   │   ├── app/           # Routes & layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # API utilities
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── backend/               # Django REST API
│   ├── apps/
│   ├── config/
│   └── requirements.txt
│
└── .github/workflows/     # CI/CD pipelines
```

---

# 🚀 Quick Start

## Prerequisites

* Node.js 18+
* Python 3.12+
* Docker (optional)

---

## Frontend (Next.js)

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

Start development server:

```bash
npm run dev
```

Runs at:

```
http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

---

## Backend (Django API)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Runs at:

```
http://localhost:8000
```

---

## Docker (Backend Only)

```bash
cd backend
cp .env.example .env
docker compose up --build
```

---

# 🔐 Environment Variables

## Frontend (`frontend/.env`)

| Variable               | Description                   |
| ---------------------- | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the frontend      |
| `NEXT_PUBLIC_API_URL`  | Backend API base URL          |
| `NODE_ENV`             | `development` or `production` |

---

## Backend (`backend/.env`)

| Variable               | Description                         | Example                                        |
| ---------------------- | ----------------------------------- | ---------------------------------------------- |
| `DJANGO_SECRET_KEY`    | Django secret key                   | Required                                       |
| `DEBUG`                | Debug mode                          | True                                           |
| `ALLOWED_HOSTS`        | Allowed hostnames                   | localhost,127.0.0.1                            |
| `CORS_ALLOWED_ORIGINS` | Frontend URL                        | [http://localhost:3000](http://localhost:3000) |
| `DATABASE_URL`         | PostgreSQL connection string (prod) | postgres://...                                 |

---

# 📘 API Documentation

Once backend is running:

* Swagger UI → `http://localhost:8000/api/docs/`
* OpenAPI Schema → `http://localhost:8000/api/schema/`

---

# 🧩 Core Modules

* Student Management — Enrollment, profiles, academic history
* Staff Management — Registration, assignments, attendance
* Academic Management — Classes, subjects, timetables
* Attendance — Daily tracking, reports
* Examinations — Grading and report cards
* Fees — Billing, payments, financial reports
* Communications — Announcements and notifications

---

# 🧪 Development

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Lint

```bash
cd frontend
npm run lint
```

---

# 🚢 Deployment Flow

1. Push to `main`
2. GitHub Actions builds Docker image
3. Image pushed to GitHub Container Registry
4. Deployment triggered on VPS

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/name
   ```
3. Commit changes

   ```bash
   git commit -m "Add feature"
   ```
4. Push branch

   ```bash
   git push origin feature/name
   ```
5. Open a Pull Request

