# School Management System

A comprehensive school management platform for academic and administrative operations.

## Overview

Modern web application built with a React frontend and Django REST API backend. Designed to streamline student records, academic management, financial tracking, and communication.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Django, Django REST Framework |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Deployment | Docker, GitHub Actions, VPS |

## Project Structure
```
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
├── backend/           # Django API
│   ├── apps/
│   ├── config/
│   └── requirements.txt
└── .github/workflows/ # CI/CD
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker (optional)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Runs at `http://localhost:8000`

### Docker (Backend)
```bash
cd backend
cp .env.example .env
docker compose up
```

## API Documentation

Once backend is running:

- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Secret key for Django | Required |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | `http://localhost:5173` |

## Core Modules

- **Student Management** – Enrollment, profiles, academic history
- **Staff Management** – Registration, assignments, attendance
- **Academic Management** – Classes, subjects, timetables
- **Attendance** – Daily tracking, reports, alerts
- **Examinations** – Assessments, grading, report cards
- **Fees** – Billing, payments, financial reports
- **Communications** – Announcements, messaging, notifications

## Development

### Running Tests
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

### Linting
```bash
# Backend
pip install ruff
ruff check .

# Frontend
npm run lint
```

## Deployment

### Quick Deploy

1. Push to `main` branch
2. GitHub Actions builds Docker image
3. Image pushed to GitHub Container Registry
4. Auto-deploys to VPS via SSH

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to branch (`git push origin feature/name`)
5. Open a Pull Request
