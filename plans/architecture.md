# CyberSafe GH - Project Architecture

## System Overview

CyberSafe GH is an AI-powered scam and phishing detection platform built for Ghana. Users submit suspicious messages (SMS, email, WhatsApp) or screenshots and receive risk assessments, scam classifications, and safety advice. The detection engine is rule-based with Ghana-specific pattern recognition.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                           │
│                                                                    │
│   React 19 + Material UI v9 + React Router v7 + Recharts          │
│                                                                    │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────┐  │
│   │   Home   │  │ Results  │  │ Dashboard │  │   Community    │  │
│   │  (Form)  │  │ (Report) │  │ (Charts)  │  │  (Reports)     │  │
│   └────┬─────┘  └──────────┘  └─────┬─────┘  └───────┬────────┘  │
│        │                            │                 │            │
│   ┌────┴────────────────────────────┴─────────────────┴────────┐  │
│   │              Context API (Analysis + Auth)                  │  │
│   └────────────────────────┬────────────────────────────────────┘  │
│                            │                                       │
│   ┌────────────────────────┴────────────────────────────────────┐  │
│   │                  Axios HTTP Client                           │  │
│   │              (services/api.js)                               │  │
│   └────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────────┘
                             │  HTTP/REST (JSON)
                             │  Port 3000 → Port 8000
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     SERVER (FastAPI)                                │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                    API Layer                                │   │
│   │   /api/v1/analyze  │  /api/v1/dashboard  │  /api/v1/admin  │   │
│   │   /api/v1/reports  │  /api/v1/community  │  /api/v1/ocr    │   │
│   └──────────┬─────────┴──────────┬──────────┴────────┬────────┘   │
│              │                    │                    │            │
│   ┌──────────┴────────────────────┴────────────────────┴────────┐  │
│   │                   Service Layer                              │  │
│   │  analysis_service  │  indicator_service  │  confidence_svc   │  │
│   │  sender_service    │  ghana_patterns_svc │  ocr_service      │  │
│   │  report_service    │  admin_service       │                   │  │
│   └──────────┬─────────┴──────────┬──────────┴──────────────────┘  │
│              │                    │                                 │
│   ┌──────────┴────────────────────┴─────────────────────────────┐  │
│   │                   Data Layer                                 │  │
│   │   SQLAlchemy ORM  │  Pydantic Schemas  │  Session Mgmt      │  │
│   └──────────┬──────────────────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────────────┘
               │  SQL (psycopg2)
               ▼
┌──────────────────────────┐
│    PostgreSQL Database   │
│    (cybersafe_gh)        │
│                          │
│  analyzed_messages       │
│  detected_indicators     │
│  community_reports       │
│  report_votes            │
│  admin_users             │
└──────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React 19, Material UI v9, Recharts, Axios      |
| Routing     | React Router v7                                 |
| State       | Context API (AnalysisContext, AuthContext)       |
| Backend     | Python, FastAPI                                 |
| ORM         | SQLAlchemy (sync mode)                          |
| Validation  | Pydantic v2                                     |
| Database    | PostgreSQL 18                                   |
| Auth        | JWT (HS256) + bcrypt                            |
| OCR         | Pillow + Tesseract                              |
| Styling     | MUI Theme (Google Material Design)              |

---

## Directory Structure

```
fraud/
├── .gitignore
├── CLAUDE.md
├── CyberSafe_GH_Project_Documentation.md
├── plans/
│   ├── implementation-plan.md
│   ├── implementation-progress.md
│   └── architecture.md              ← this file
│
├── backend/
│   ├── .env                         # DATABASE_URL, CORS_ORIGINS, JWT secrets
│   ├── .env.example
│   ├── requirements.txt
│   ├── main.py                      # FastAPI entrypoint, lifespan, CORS
│   └── app/
│       ├── api/                     # Route handlers (thin controllers)
│       │   ├── router.py            # Mounts all sub-routers at /api/v1
│       │   ├── analyze.py           # POST /analyze, POST /analyze/v2
│       │   ├── dashboard.py         # GET /dashboard/stats
│       │   ├── ocr.py               # POST /analyze/screenshot
│       │   ├── reports.py           # CRUD for community reports + voting
│       │   └── admin.py             # Admin login, moderation endpoints
│       ├── core/
│       │   ├── config.py            # Pydantic BaseSettings (.env loader)
│       │   └── auth.py              # JWT creation/verification, admin guard
│       ├── database/
│       │   ├── session.py           # Engine, SessionLocal, Base
│       │   └── deps.py              # get_db() dependency
│       ├── models/                  # SQLAlchemy ORM models
│       │   ├── message.py           # AnalyzedMessage
│       │   ├── indicator.py         # DetectedIndicator
│       │   ├── report.py            # CommunityReport
│       │   ├── vote.py              # ReportVote
│       │   └── admin.py             # AdminUser
│       ├── schemas/                 # Pydantic request/response schemas
│       │   ├── message.py           # AnalyzeRequest/Response, DashboardStats
│       │   ├── report.py            # Report CRUD schemas
│       │   └── admin.py             # Admin auth/moderation schemas
│       └── services/               # Business logic (core engine)
│           ├── analysis_service.py  # Orchestrator: score → classify → explain
│           ├── indicator_service.py # Keyword/regex/URL detection
│           ├── confidence_service.py# Confidence score calculation
│           ├── sender_service.py    # Sender legitimacy analysis
│           ├── ghana_patterns_service.py  # Ghana-specific scam patterns
│           ├── ocr_service.py       # Image → text extraction
│           ├── report_service.py    # Community report operations
│           └── admin_service.py     # Admin auth & moderation logic
│
└── frontend/
    ├── .env                         # REACT_APP_API_URL
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                   # Router + Providers + Theme
        ├── App.css                  # Empty (CssBaseline handles resets)
        ├── theme.js                 # Google Material Design theme
        ├── index.js                 # DOM render entry
        ├── context/
        │   ├── AnalysisContext.jsx   # Analysis state + API calls
        │   └── AuthContext.jsx       # Admin auth state + localStorage
        ├── services/
        │   └── api.js               # Axios client, all API functions
        ├── utils/
        │   ├── riskHelpers.js       # Color/label/icon helpers
        │   └── sessionHelper.js     # Anonymous session ID for voting
        ├── pages/
        │   ├── Home.jsx             # Landing page + analyzer form
        │   ├── Results.jsx          # Full analysis report display
        │   ├── Dashboard.jsx        # Analytics charts + stats
        │   ├── Community.jsx        # Community scam reports listing
        │   ├── ReportScam.jsx       # Submit a scam report
        │   ├── ReportDetail.jsx     # Single report view
        │   ├── AdminLogin.jsx       # Admin authentication
        │   └── AdminDashboard.jsx   # Moderation interface
        └── components/
            ├── analyzer/
            │   ├── AnalyzerForm.jsx       # Text/screenshot input with validation
            │   └── ScreenshotUpload.jsx   # Drag-and-drop image upload
            ├── risk/
            │   ├── RiskScoreGauge.jsx      # Circular progress score display
            │   ├── RiskLevelBadge.jsx      # Color-coded risk chip
            │   ├── ScamCategoryCard.jsx    # Scam type with icon
            │   ├── IndicatorList.jsx       # Matched indicator list
            │   ├── ExplanationCard.jsx     # Why this is risky
            │   ├── AdviceCard.jsx          # Safety recommendations
            │   ├── ConfidenceIndicator.jsx # Detection confidence %
            │   ├── SenderAnalysis.jsx      # Sender legitimacy
            │   ├── GhanaPatterns.jsx       # Ghana-specific detections
            │   ├── MessagePreview.jsx      # Formatted message display
            │   ├── TextHighlighter.jsx     # Highlights risky keywords
            │   ├── EmailPreview.jsx        # Email-style preview
            │   ├── PhonePreview.jsx        # SMS-style preview
            │   └── WhatsAppPreview.jsx     # WhatsApp-style preview
            ├── dashboard/
            │   ├── StatCard.jsx            # Metric card with icon
            │   ├── CategoryPieChart.jsx    # Scam category distribution
            │   └── RiskBarChart.jsx        # Risk level bar chart
            ├── community/
            │   ├── ReportCard.jsx          # Report preview card
            │   ├── ReportFilters.jsx       # Category/sort filters
            │   └── VoteButtons.jsx         # Upvote/downvote
            ├── admin/
            │   ├── AdminReportTable.jsx    # Moderation table
            │   └── ModerationDialog.jsx    # Approve/reject/flag dialog
            ├── layout/
            │   ├── Layout.jsx             # Page wrapper
            │   ├── Navbar.jsx             # Top bar + mobile drawer
            │   └── Footer.jsx             # Footer
            └── common/
                ├── EmptyState.jsx         # No-data placeholder
                └── LoadingSkeleton.jsx    # Loading skeleton
```

---

## Backend Architecture

### Layered Design

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│           API Layer (Routes)             │
│  - Input validation (Pydantic)           │
│  - Input sanitization                    │
│  - HTTP response formatting              │
│  - NO business logic                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│          Service Layer (Logic)           │
│  - Risk scoring engine                   │
│  - Indicator detection                   │
│  - Scam classification                   │
│  - Confidence calculation                │
│  - Sender analysis                       │
│  - Ghana-specific patterns               │
│  - Report management                     │
│  - Admin operations                      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           Data Layer (ORM)               │
│  - SQLAlchemy models                     │
│  - Database session management           │
│  - Pydantic response serialization       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
              PostgreSQL
```

### Key Design Decisions

- **Sync SQLAlchemy + FastAPI**: Route handlers use `def` (not `async def`) so FastAPI runs them in a threadpool, avoiding blocking the event loop with synchronous DB calls.
- **Table creation**: `Base.metadata.create_all` runs via `asyncio.to_thread()` in the lifespan handler.
- **Input sanitization**: Null byte removal → HTML entity decoding → script block removal → HTML tag stripping (order matters).
- **Dependency injection**: `get_db()` generator provides database sessions; `get_current_admin()` validates JWT tokens.

---

## Risk Scoring Engine

### Analysis Pipeline

```
Raw Message Text
    │
    ▼
┌──────────────────┐
│  1. Normalize     │  Lowercase, strip whitespace
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  2. Detect        │  7 indicator checks (keywords, regex, URLs)
│     Indicators    │  Each returns {name, score}
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  3. Calculate     │  Sum indicator scores, cap at 100
│     Risk Score    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  4. Assign        │  Low (0-25) │ Medium (26-50)
│     Risk Level    │  High (51-75) │ Critical (76-100)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  5. Classify      │  Map to 1 of 9 scam categories
│     Category      │  (or "Safe" if score=0)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  6. Generate      │  Human-readable explanation
│     Explanation   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  7. Generate      │  Actionable safety advice
│     Advice        │
└────────┬─────────┘
         │
         ▼ (V2 only)
┌──────────────────┐
│  8. Confidence    │  0-100% detection confidence
│     Score         │
└────────┬─────────┘
         │
         ▼ (V2 only)
┌──────────────────┐
│  9. Sender        │  Legitimacy check against
│     Analysis      │  known Ghana entities
└────────┬─────────┘
         │
         ▼ (V2 only)
┌──────────────────┐
│ 10. Ghana         │  MoMo, MTN promo, E-Levy,
│     Patterns      │  GRA, NHIS, Cocobod scams
└──────────────────┘
```

### Indicator Scoring Table

| Indicator                    | Score | Detection Method         |
|------------------------------|-------|--------------------------|
| OTP/PIN/password/card details| +25   | Keyword matching         |
| Urgency words                | +15   | Keyword list             |
| Suspicious links             | +20   | URL regex extraction     |
| Money/reward/prize mentions  | +15   | Keyword matching         |
| Payment requests             | +20   | Keyword matching         |
| Bank/telco impersonation     | +10   | Keyword matching         |
| Account suspension threats   | +15   | Phrase matching          |

### Scam Categories

| Category               | Primary Indicators                    |
|------------------------|---------------------------------------|
| Mobile Money Fraud     | MoMo, mobile money, transfer keywords |
| Phishing               | Links + credential requests           |
| Fake Bank Alert        | Bank names + account threats          |
| Fake Job Scam          | Job offer + payment request           |
| Fake Loan Scam         | Loan offer + upfront fees             |
| Fake Prize Scam        | Prize/winner + claim action           |
| Delivery Scam          | Package/delivery + payment            |
| Identity Theft Attempt | Personal info request patterns        |
| OTP/PIN Theft Attempt  | OTP/PIN/verification code requests    |
| Safe                   | Score = 0, no indicators              |

### Confidence Score Calculation

```
Base: 50

+ Indicator diversity bonus    (max +30, +8 per distinct type)
+ Category match bonus         (+5 to +10)
+ Risk score alignment bonus   (+5 to +10)
- Ambiguity penalties          (-5 to -15)

Result: clamped to 0-100
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────┐       ┌──────────────────────────┐
│    analyzed_messages     │       │   detected_indicators    │
├─────────────────────────┤       ├──────────────────────────┤
│ id (UUID, PK)           │──1:N──│ id (UUID, PK)            │
│ message_text (Text)     │       │ message_id (UUID, FK)    │
│ risk_score (Integer)    │       │ indicator_name (String)  │
│ risk_level (String)     │       │ indicator_score (Integer)│
│ scam_category (String)  │       └──────────────────────────┘
│ explanation (Text)      │
│ confidence (Integer)    │
│ sender_info (String)    │
│ message_type (String)   │
│ source_type (String)    │
│ original_image_hash     │
│ created_at (DateTime)   │
└─────────────────────────┘

┌─────────────────────────┐       ┌──────────────────────────┐
│   community_reports     │       │     report_votes         │
├─────────────────────────┤       ├──────────────────────────┤
│ id (UUID, PK)           │──1:N──│ id (UUID, PK)            │
│ reporter_name (String)  │       │ report_id (UUID, FK)     │
│ reporter_session_id     │       │ session_id (String)      │
│ message_text (Text)     │       │ vote_type (String)       │
│ message_type (String)   │       │ created_at (DateTime)    │
│ sender_info (String)    │       │                          │
│ scam_category (String)  │       │ UNIQUE(report_id,        │
│ description (Text)      │       │        session_id)       │
│ auto_risk_score (Int)   │       └──────────────────────────┘
│ auto_risk_level (String)│
│ auto_scam_category      │       ┌──────────────────────────┐
│ auto_confidence (Int)   │       │     admin_users          │
│ status (String)         │       ├──────────────────────────┤
│ moderation_note (Text)  │       │ id (UUID, PK)            │
│ moderated_by (UUID, FK) │──N:1──│ username (String, UQ)    │
│ moderated_at (DateTime) │       │ password_hash (String)   │
│ upvote_count (Integer)  │       │ display_name (String)    │
│ downvote_count (Integer)│       │ role (String)            │
│ view_count (Integer)    │       │ is_active (Boolean)      │
│ created_at (DateTime)   │       │ created_at (DateTime)    │
│ updated_at (DateTime)   │       │ last_login (DateTime)    │
└─────────────────────────┘       └──────────────────────────┘
```

### Relationships

- `analyzed_messages` → `detected_indicators`: One-to-many (cascade delete)
- `community_reports` → `report_votes`: One-to-many (cascade delete, unique vote per session)
- `admin_users` → `community_reports`: One-to-many via `moderated_by` FK

---

## API Endpoints

### Analysis

| Method | Endpoint                | Auth | Description                           |
|--------|-------------------------|------|---------------------------------------|
| POST   | `/api/v1/analyze`       | No   | V1 basic analysis                     |
| POST   | `/api/v1/analyze/v2`    | No   | V2 enhanced (confidence, sender, GH)  |
| POST   | `/api/v1/analyze/screenshot` | No | OCR text extraction + analysis   |

### Dashboard

| Method | Endpoint                | Auth | Description                           |
|--------|-------------------------|------|---------------------------------------|
| GET    | `/api/v1/dashboard/stats` | No | Aggregated analytics                  |

### Community

| Method | Endpoint                          | Auth | Description                    |
|--------|-----------------------------------|------|--------------------------------|
| POST   | `/api/v1/reports`                 | No   | Create scam report             |
| GET    | `/api/v1/reports`                 | No   | List approved reports          |
| GET    | `/api/v1/reports/{id}`            | No   | Get single report              |
| POST   | `/api/v1/reports/{id}/vote`       | No   | Vote on report (session-based) |
| GET    | `/api/v1/community/stats`         | No   | Community statistics           |

### Admin

| Method | Endpoint                              | Auth   | Description              |
|--------|---------------------------------------|--------|--------------------------|
| POST   | `/api/v1/admin/login`                 | No     | Get JWT token            |
| GET    | `/api/v1/admin/dashboard`             | Bearer | Admin statistics         |
| GET    | `/api/v1/admin/reports`               | Bearer | All reports (moderation) |
| PUT    | `/api/v1/admin/reports/{id}/moderate` | Bearer | Approve/reject/flag      |

---

## Frontend Architecture

### Routing Map

```
/                    → Home.jsx         (Analyzer form + landing)
/results             → Results.jsx      (Analysis results display)
/dashboard           → Dashboard.jsx    (Analytics charts)
/community           → Community.jsx    (Community reports)
/report              → ReportScam.jsx   (Submit new report)
/report/:id          → ReportDetail.jsx (Single report view)
/admin/login         → AdminLogin.jsx   (Admin authentication)
/admin/dashboard     → AdminDashboard.jsx (Moderation panel)
```

### State Management

```
┌─────────────────────────────────────────────────┐
│                    App.js                        │
│  ThemeProvider (light/dark toggle)               │
│  ┌─────────────────────────────────────────────┐ │
│  │           AnalysisProvider                   │ │
│  │  State: result, ocrResult, loading, error   │ │
│  │  Methods: analyzeMessage(),                 │ │
│  │           analyzeScreenshot(), clearResult() │ │
│  │  ┌─────────────────────────────────────────┐│ │
│  │  │           AuthProvider                   ││ │
│  │  │  State: token, admin, isAuthenticated   ││ │
│  │  │  Methods: login(), logout()             ││ │
│  │  │  Storage: localStorage                  ││ │
│  │  │  ┌─────────────────────────────────────┐││ │
│  │  │  │         BrowserRouter               │││ │
│  │  │  │    ┌─────────────────────────┐      │││ │
│  │  │  │    │      Layout             │      │││ │
│  │  │  │    │  ┌───────────────────┐  │      │││ │
│  │  │  │    │  │  Navbar           │  │      │││ │
│  │  │  │    │  │  Page Routes      │  │      │││ │
│  │  │  │    │  │  Footer           │  │      │││ │
│  │  │  │    │  └───────────────────┘  │      │││ │
│  │  │  │    └─────────────────────────┘      │││ │
│  │  │  └─────────────────────────────────────┘││ │
│  │  └─────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Navbar
│   ├── Desktop: Button links
│   └── Mobile: Drawer menu
│
├── Home
│   ├── Hero section
│   ├── AnalyzerForm
│   │   ├── Text input tab
│   │   │   ├── TextField (message)
│   │   │   ├── Select (message type)
│   │   │   └── TextField (sender info)
│   │   ├── Screenshot tab
│   │   │   └── ScreenshotUpload
│   │   ├── Snackbar (errors)
│   │   └── Dialog (short message confirm)
│   └── Feature cards (Grid)
│
├── Results
│   ├── MessagePreview / EmailPreview / PhonePreview / WhatsAppPreview
│   ├── TextHighlighter
│   ├── RiskScoreGauge
│   ├── ConfidenceIndicator
│   ├── RiskLevelBadge
│   ├── ScamCategoryCard
│   ├── IndicatorList
│   ├── ExplanationCard
│   ├── AdviceCard
│   ├── SenderAnalysis
│   └── GhanaPatterns
│
├── Dashboard
│   ├── StatCard ×3 (total, high-risk%, top category)
│   ├── CategoryPieChart (Recharts)
│   ├── RiskBarChart (Recharts)
│   └── Recent Analyses Table
│
├── Community
│   ├── ReportFilters
│   ├── ReportCard (list)
│   └── FAB → /report
│
├── ReportScam (form)
├── ReportDetail
│   └── VoteButtons
│
├── AdminLogin (form)
├── AdminDashboard
│   ├── AdminReportTable
│   └── ModerationDialog
│
└── Footer
```

---

## Theme & Styling

### Google Material Design Theme

| Property         | Value                                       |
|------------------|---------------------------------------------|
| Primary          | `#1a73e8` (Google Blue)                     |
| Secondary        | `#00c853` (Green)                           |
| Font Family      | Google Sans, Roboto, Helvetica Neue         |
| Button Style     | Pill shape (`borderRadius: 20`), no caps    |
| Card Style       | Flat with border, hover elevation           |
| Shadows          | `rgba(60,64,67,...)` (Google-style)         |
| Dialogs          | 16px border radius                          |
| Text Fields      | 8px radius, focus glow                      |
| Dark Mode        | Full theme toggle via Navbar icon            |

### Risk Color Palette

| Level    | Color     | Hex       |
|----------|-----------|-----------|
| Low      | Green     | `#2e7d32` |
| Medium   | Amber     | `#f9a825` |
| High     | Orange    | `#e65100` |
| Critical | Red       | `#c62828` |

---

## Data Flow Diagrams

### Message Analysis Flow

```
User                Frontend                    Backend                 Database
  │                    │                           │                       │
  │  Enter message     │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  POST /analyze/v2         │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Sanitize input       │
  │                    │                           │  Normalize text       │
  │                    │                           │  Detect indicators    │
  │                    │                           │  Calculate score      │
  │                    │                           │  Classify category    │
  │                    │                           │  Generate explanation │
  │                    │                           │  Generate advice      │
  │                    │                           │  Calc confidence      │
  │                    │                           │  Analyze sender       │
  │                    │                           │  Check GH patterns    │
  │                    │                           │                       │
  │                    │                           │  INSERT message       │
  │                    │                           │──────────────────────>│
  │                    │                           │  INSERT indicators    │
  │                    │                           │──────────────────────>│
  │                    │                           │                       │
  │                    │  AnalyzeResponseV2 (JSON) │                       │
  │                    │<──────────────────────────│                       │
  │                    │                           │                       │
  │                    │  Navigate to /results     │                       │
  │                    │  Render all risk cards     │                       │
  │  View results      │                           │                       │
  │<───────────────────│                           │                       │
```

### Screenshot Analysis Flow

```
User                Frontend                    Backend                 Database
  │                    │                           │                       │
  │  Upload image      │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  POST /analyze/screenshot │                       │
  │                    │  (multipart/form-data)    │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Validate file type   │
  │                    │                           │  Compute SHA-256 hash │
  │                    │                           │  Extract text (OCR)   │
  │                    │                           │  Run analysis pipeline│
  │                    │                           │  Save to DB           │
  │                    │                           │──────────────────────>│
  │                    │                           │                       │
  │                    │  ScreenshotAnalyzeResponse│                       │
  │                    │<──────────────────────────│                       │
  │  View results      │                           │                       │
  │<───────────────────│                           │                       │
```

### Community Report Flow

```
User                Frontend                    Backend                 Database
  │                    │                           │                       │
  │  Submit report     │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  POST /reports            │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Auto-analyze message │
  │                    │                           │  Create report record │
  │                    │                           │──────────────────────>│
  │                    │  ReportResponse           │                       │
  │                    │<──────────────────────────│                       │
  │                    │                           │                       │
  │  Vote on report    │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  POST /reports/{id}/vote  │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Check existing vote  │
  │                    │                           │  Toggle/update vote   │
  │                    │                           │──────────────────────>│
  │                    │  VoteResponse             │                       │
  │                    │<──────────────────────────│                       │
```

### Admin Moderation Flow

```
Admin               Frontend                    Backend                 Database
  │                    │                           │                       │
  │  Login             │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  POST /admin/login        │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Verify credentials   │
  │                    │                           │  Generate JWT (24hr)  │
  │                    │  { token, admin }         │                       │
  │                    │<──────────────────────────│                       │
  │                    │  Store in localStorage    │                       │
  │                    │                           │                       │
  │  View reports      │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  GET /admin/reports       │                       │
  │                    │  Authorization: Bearer    │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Validate JWT         │
  │                    │                           │  Query all reports    │
  │                    │                           │──────────────────────>│
  │                    │  ReportListResponse       │                       │
  │                    │<──────────────────────────│                       │
  │                    │                           │                       │
  │  Moderate report   │                           │                       │
  │───────────────────>│                           │                       │
  │                    │  PUT /admin/reports/{id}/ │                       │
  │                    │      moderate             │                       │
  │                    │──────────────────────────>│                       │
  │                    │                           │  Update status        │
  │                    │                           │  Record moderator     │
  │                    │                           │──────────────────────>│
  │                    │  Updated report           │                       │
  │                    │<──────────────────────────│                       │
```

---

## Security

### Input Sanitization Pipeline

```
Raw Input
    │
    ▼
1. Remove null bytes (\x00)
    │
    ▼
2. Decode HTML entities (html.unescape)
    │
    ▼
3. Strip <script>...</script> blocks
    │
    ▼
4. Remove remaining HTML tags
    │
    ▼
5. Trim whitespace
    │
    ▼
Clean Text → Analysis Engine
```

### Authentication

- **JWT tokens**: HS256 algorithm, 24-hour expiry
- **Password storage**: bcrypt hashing
- **Protected routes**: `get_current_admin()` dependency validates Bearer token
- **Session-based voting**: Anonymous session ID stored in `sessionStorage`

### File Upload Validation

- Allowed types: PNG, JPEG, WebP
- Max size: 5MB
- SHA-256 hash for deduplication

---

## Ghana-Specific Features

### Detected Scam Patterns

| Pattern                | Description                                      |
|------------------------|--------------------------------------------------|
| MoMo Reversal Scam     | "Sent money by mistake, please return"           |
| MTN Promo Scam         | Fake MTN promotions/prizes                       |
| E-Levy Refund Scam     | Fake government E-Levy refund offers             |
| GRA Impersonation      | Fake Ghana Revenue Authority notices             |
| NHIS Registration Scam | Fake National Health Insurance messages           |
| Cocobod Payment Scam   | Fake cocoa board payment notifications           |

### Known Legitimate Entities

| Entity           | Short Codes / Domains                              |
|------------------|----------------------------------------------------|
| MTN Ghana        | 1515, 5050, 1355, 1390                             |
| Vodafone Ghana   | 1000, 5015, 100                                    |
| AirtelTigo       | 1211, 1234, 126                                    |
| Glo Ghana        | 1244, 127                                          |
| GCB Bank         | gcbbank.com.gh                                     |
| Ecobank          | ecobank.com                                        |
| Stanbic Bank     | stanbicbank.com.gh                                 |

### Suspicious Indicators

- Nigerian phone prefix (+234) flagged as potential cross-border scam
- Non-Ghanaian domains impersonating local banks

---

## Build & Run

### Backend

```bash
cd backend
pip install -r requirements.txt
# Create .env with DATABASE_URL and CORS_ORIGINS
uvicorn main:app --reload          # → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
# Create .env with REACT_APP_API_URL=http://localhost:8000/api/v1
npm start                           # → http://localhost:3000
```

### Database

```bash
# PostgreSQL must be running
# Tables are auto-created on backend startup via SQLAlchemy
# Default admin account is created on first run
```

### Environment Variables

**Backend `.env`:**
```
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/cybersafe_gh
CORS_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=<your-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```
