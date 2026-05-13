# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CyberSafe GH** — An AI-powered scam and phishing detection web platform for Ghana. Users submit suspicious messages (SMS, email, WhatsApp) and receive risk scores, scam classifications, explanations, and safety advice. The detection engine is rule-based (not ML) for the MVP phase.

## Current Status

This repository currently contains only the project specification (`CyberSafe_GH_Project_Documentation.md`). No implementation code exists yet. Refer to that document as the source of truth for all requirements.

## Tech Stack

- **Frontend:** React (functional components), Material UI (MUI), Axios, React Router, Context API
- **Backend:** Python, FastAPI, SQLAlchemy ORM, Pydantic
- **Database:** PostgreSQL

## Architecture

### Backend (`backend/`)

Layered structure — keep business logic out of route handlers:

- `app/api/` — FastAPI route definitions
- `app/services/` — Core logic: `analysis_service.py` (text preprocessing, scoring, classification, explanation), `indicator_service.py` (keyword matching, regex, URL extraction)
- `app/models/` — SQLAlchemy ORM models
- `app/schemas/` — Pydantic request/response schemas
- `app/database/` — DB connection and session management
- `app/core/` — Config, constants
- `main.py` — FastAPI app entrypoint

### Frontend (`src/`)

- `pages/` — Home (analyzer form), Results (risk display), Dashboard (analytics/charts)
- `components/` — Organized by feature: `analyzer/`, `dashboard/`, `layout/`, `risk/`
- `services/api.js` — All backend HTTP calls via Axios
- `context/AnalysisContext.jsx` — Shared state via Context API
- `utils/riskHelpers.js` — Risk level calculation helpers

## API Endpoints

- `POST /api/v1/analyze` — Analyze a message, returns risk_score, risk_level, scam_category, indicators, explanation, advice
- `GET /api/v1/dashboard/stats` — Dashboard analytics

## Risk Scoring Engine

Cumulative score from matched indicators (capped at 100):

| Indicator | Score |
|---|---|
| OTP/PIN/password/card details | +25 |
| Urgency words (urgent, immediately, blocked, suspended, verify now, limited time) | +15 |
| Suspicious links | +20 |
| Money/reward/prize mentions | +15 |
| Payment requests | +20 |
| Bank/telco impersonation | +10 |
| Account suspension threats | +15 |

Risk levels: Low (0-25), Medium (26-50), High (51-75), Critical (76-100).

Nine scam categories: Mobile Money Fraud, Phishing, Fake Bank Alert, Fake Job Scam, Fake Loan Scam, Fake Prize Scam, Delivery Scam, Identity Theft Attempt, OTP/PIN Theft Attempt.

## Database Tables

- `analyzed_messages` — id (UUID), message_text, risk_score, risk_level, scam_category, explanation, created_at
- `detected_indicators` — id (UUID), message_id (FK), indicator_name, indicator_score

## Coding Conventions

- **Frontend:** Functional React components only. Separate UI from API logic. Use environment variables for API URLs.
- **Backend:** Separate routes, services, and models. Use Pydantic schemas for validation. Use dependency injection. No business logic in route handlers.
- **UI colors:** Low=Green, Medium=Yellow, High=Orange, Critical=Red

## Build & Run Commands

Once implemented, expected commands:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend   # or project root if React is at root
npm install
npm start
```
