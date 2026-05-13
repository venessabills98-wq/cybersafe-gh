# CyberSafe GH
## AI Scam & Phishing Detection Platform for Ghana

---

# 1. Project Overview

## Project Name
CyberSafe GH

## Project Type
AI-powered cybersecurity web application.

## Goal
Build a web platform that helps users in Ghana detect:
- scam messages,
- phishing attempts,
- fraud messages,
- impersonation attacks,
- fake mobile money alerts,
- fake bank alerts,
- fake job offers,
- malicious links.

The system should analyze text messages submitted by users and return:
- a risk score,
- scam classification,
- explanation,
- warning indicators,
- and safety recommendations.

---

# 2. Core Objectives

The application must:
1. Accept suspicious text messages from users.
2. Analyze the message using rule-based AI logic.
3. Detect phishing/scam indicators.
4. Return a risk level.
5. Explain why the message is dangerous.
6. Provide security advice.
7. Store analysis results in PostgreSQL.
8. Provide dashboard analytics.

---

# 3. Technology Stack

## Frontend
- React
- Material UI (MUI)
- Axios
- React Router
- Context API

## Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

## Database
- PostgreSQL

## Optional AI/NLP Libraries
- regex
- scikit-learn
- spaCy
- transformers (future phase)

---

# 4. System Architecture

## Frontend Responsibilities
The React frontend should:
- provide UI pages,
- collect user input,
- call backend APIs,
- display risk analysis,
- show dashboard analytics,
- visualize scam statistics.

## Backend Responsibilities
The Python backend should:
- process requests,
- analyze messages,
- calculate risk scores,
- classify scam types,
- generate explanations,
- store results,
- expose REST APIs.

## Database Responsibilities
PostgreSQL should store:
- analyzed messages,
- risk scores,
- classifications,
- analytics data,
- scam categories.

---

# 5. Application Features

## Feature 1: Message Analyzer

### Description
Users paste suspicious messages into a text field.

### Inputs
- SMS content
- Email content
- WhatsApp message

### Actions
- Click Analyze button

### Outputs
- Risk score
- Risk level
- Scam category
- Risk indicators
- Explanation
- Safety advice

---

## Feature 2: Risk Classification

### Risk Levels

| Score Range | Risk Level |
|---|---|
| 0–25 | Low |
| 26–50 | Medium |
| 51–75 | High |
| 76–100 | Critical |

---

## Feature 3: Scam Detection Categories

The system should detect:
- Mobile Money Fraud
- Phishing
- Fake Bank Alert
- Fake Job Scam
- Fake Loan Scam
- Fake Prize Scam
- Delivery Scam
- Identity Theft Attempt
- OTP/PIN Theft Attempt

---

## Feature 4: Dashboard Analytics

### Dashboard Metrics
- Total analyzed messages
- Scam category distribution
- High-risk percentage
- Common keywords
- Most detected scam types

### Charts
- Pie chart for scam categories
- Bar chart for risk levels
- Trend chart for daily scans

---

# 6. AI Detection Engine

## Detection Strategy
Use a rule-based AI scoring engine.

---

# 7. Risk Scoring Rules

| Indicator | Score |
|---|---|
| Contains OTP/PIN/password/card details | +25 |
| Contains urgency words | +15 |
| Contains suspicious links | +20 |
| Mentions money/reward/prize | +15 |
| Requests payment | +20 |
| Mentions bank/telco impersonation | +10 |
| Threatens account suspension | +15 |

---

# 8. Suspicious Keywords

## Urgency Keywords

```text
urgent
immediately
blocked
suspended
verify now
limited time
```

## Financial Keywords

```text
reward
prize
money
loan
payment
fee
cash
```

## Credential Theft Keywords

```text
otp
pin
password
card
cvv
verification code
```

---

# 9. Scam Detection Logic

## Detection Flow

### Step 1
Normalize input text:
- lowercase conversion,
- whitespace cleanup,
- remove special formatting.

### Step 2
Extract:
- URLs,
- phone numbers,
- suspicious keywords,
- urgency indicators,
- impersonation indicators.

### Step 3
Calculate cumulative risk score.

### Step 4
Determine:
- risk level,
- scam category.

### Step 5
Generate explanation.

---

# 10. Database Design

## Table: analyzed_messages

| Column | Type |
|---|---|
| id | UUID |
| message_text | TEXT |
| risk_score | INTEGER |
| risk_level | VARCHAR |
| scam_category | VARCHAR |
| explanation | TEXT |
| created_at | TIMESTAMP |

---

## Table: detected_indicators

| Column | Type |
|---|---|
| id | UUID |
| message_id | UUID |
| indicator_name | VARCHAR |
| indicator_score | INTEGER |

---

# 11. Backend API Design

## Base URL

```text
/api/v1
```

---

## Endpoint: Analyze Message

### POST

```text
/api/v1/analyze
```

### Request Body

```json
{
  "message": "Your MoMo account has been suspended. Verify now."
}
```

### Response

```json
{
  "risk_score": 85,
  "risk_level": "Critical",
  "scam_category": "Mobile Money Fraud",
  "indicators": [
    "Urgency detected",
    "Account suspension threat",
    "Credential request"
  ],
  "explanation": "This message attempts to create panic and steal sensitive financial information.",
  "advice": [
    "Do not click links",
    "Do not share your PIN",
    "Verify using official channels"
  ]
}
```

---

## Endpoint: Dashboard Statistics

### GET

```text
/api/v1/dashboard/stats
```

---

# 12. Frontend Pages

## Home Page
Contains:
- project introduction,
- analyzer form,
- CTA section.

---

## Results Page
Displays:
- risk score,
- scam category,
- explanation,
- indicators,
- safety recommendations.

---

## Dashboard Page
Displays:
- charts,
- analytics,
- scam trends.

---

# 13. Frontend Component Structure

```text
src/
├── components/
│   ├── analyzer/
│   ├── dashboard/
│   ├── layout/
│   ├── risk/
│
├── pages/
│   ├── Home.jsx
│   ├── Results.jsx
│   ├── Dashboard.jsx
│
├── services/
│   ├── api.js
│
├── context/
│   ├── AnalysisContext.jsx
│
├── utils/
│   ├── riskHelpers.js
```

---

# 14. Backend Folder Structure

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── database/
│   ├── utils/
│
├── main.py
├── requirements.txt
```

---

# 15. UI/UX Requirements

## Theme
- Dark/light mode support
- Cybersecurity-inspired design
- Clean professional interface

## Colors

| Risk | Color |
|---|---|
| Low | Green |
| Medium | Yellow |
| High | Orange |
| Critical | Red |

---

# 16. Material UI Components

Use:
- Card
- Alert
- Snackbar
- Dialog
- TextField
- LinearProgress
- Chip
- DataGrid
- Drawer
- AppBar

---

# 17. Security Requirements

## Input Validation
- sanitize message input,
- limit payload size,
- prevent SQL injection.

## Backend Protection
- enable CORS safely,
- validate schemas using Pydantic,
- escape unsafe output.

---

# 18. Future Improvements

Future phases may include:
- Machine learning classification
- Real-time WhatsApp integration
- Browser extension
- SMS scanning
- Mobile app
- Fraud reporting integration
- Ghanaian language support
- OCR screenshot scanning
- Voice scam detection

---

# 19. Implementation Priority

## Phase 1 (Hackathon MVP)
Must build:
- message analyzer,
- risk engine,
- API integration,
- dashboard,
- PostgreSQL storage.

## Phase 2
Optional:
- ML model,
- authentication,
- admin dashboard.

---

# 20. Recommended Backend Logic

## Suggested Python Services

### analysis_service.py
Responsible for:
- text preprocessing,
- scoring,
- classification,
- explanation generation.

### indicator_service.py
Responsible for:
- keyword matching,
- regex checks,
- URL extraction.

---

# 21. Sample Scam Messages

## Mobile Money Fraud

```text
Your MoMo account has been blocked. Verify immediately using this link.
```

## Fake Job Scam

```text
Congratulations! You have been selected for a job. Pay registration fee now.
```

## Fake Prize Scam

```text
You have won GHS 10,000. Send your PIN to claim your reward.
```

---

# 22. Success Criteria

The MVP is successful if:
- users can analyze messages,
- the system returns meaningful risk analysis,
- dashboard analytics work,
- backend APIs respond correctly,
- the UI is responsive and clean.

---

# 23. AI Agent Instructions

## Coding Standards
- Use functional React components.
- Use async/await for API calls.
- Use reusable Material UI components.
- Use typed Pydantic schemas.
- Use SQLAlchemy ORM.
- Keep services modular.

## Frontend Rules
- Separate UI from API logic.
- Use reusable components.
- Use environment variables for API URLs.

## Backend Rules
- Separate routes, services, and models.
- Avoid business logic inside route handlers.
- Use dependency injection where appropriate.

---

# Final Recommendation

Recommended architecture:
- React + Material UI frontend
- FastAPI backend
- PostgreSQL database
- Rule-based AI engine for MVP
- Modular architecture for future ML upgrades
