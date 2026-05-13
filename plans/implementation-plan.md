# CyberSafe GH — Phased Implementation Plan

## Phase 1: Project Setup & Foundation

**Goal:** Initialize both projects, set up tooling, and establish the folder structure.

### 1.1 Backend Setup
- [ ] Create `backend/` directory with the defined folder structure (`app/api/`, `app/core/`, `app/models/`, `app/schemas/`, `app/services/`, `app/database/`, `app/utils/`)
- [ ] Create `main.py` with a minimal FastAPI app (health-check route at `GET /`)
- [ ] Create `requirements.txt` with initial dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `pydantic`, `python-dotenv`
- [ ] Create `.env.example` with placeholders for `DATABASE_URL`, `CORS_ORIGINS`
- [ ] Create `app/core/config.py` — load settings from environment variables using Pydantic `BaseSettings`

### 1.2 Frontend Setup
- [ ] Scaffold React app with `npx create-react-app frontend` (or Vite)
- [ ] Install dependencies: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `axios`, `react-router-dom`, `recharts`
- [ ] Set up folder structure inside `src/`: `components/`, `pages/`, `services/`, `context/`, `utils/`
- [ ] Create `.env` with `REACT_APP_API_URL=http://localhost:8000/api/v1`

### 1.3 Git Init
- [ ] Initialize git repo, create `.gitignore` (Python venv, node_modules, .env, __pycache__, etc.)

**Deliverable:** Both apps start without errors. Backend responds on `GET /`, frontend renders a blank MUI page.

---

## Phase 2: Database & Models

**Goal:** Set up PostgreSQL connection, define ORM models, and create tables.

### 2.1 Database Connection
- [ ] Create `app/database/session.py` — SQLAlchemy engine, `SessionLocal`, `Base` declarative base
- [ ] Create `app/database/deps.py` — `get_db()` dependency for FastAPI route injection

### 2.2 ORM Models
- [ ] Create `app/models/message.py` — `AnalyzedMessage` model:
  - `id` (UUID, primary key, default uuid4)
  - `message_text` (Text, not null)
  - `risk_score` (Integer)
  - `risk_level` (VARCHAR(20))
  - `scam_category` (VARCHAR(50))
  - `explanation` (Text)
  - `created_at` (Timestamp, server default now)
- [ ] Create `app/models/indicator.py` — `DetectedIndicator` model:
  - `id` (UUID, primary key)
  - `message_id` (UUID, ForeignKey → analyzed_messages.id)
  - `indicator_name` (VARCHAR(100))
  - `indicator_score` (Integer)
  - Relationship back to `AnalyzedMessage`

### 2.3 Table Creation
- [ ] Add startup event in `main.py` to call `Base.metadata.create_all(bind=engine)` for auto-creating tables
- [ ] Test: run backend, confirm tables are created in PostgreSQL

**Deliverable:** Tables `analyzed_messages` and `detected_indicators` exist in the database. Backend connects without errors.

---

## Phase 3: Risk Scoring Engine (Core Logic)

**Goal:** Build the rule-based detection engine — the heart of the application.

### 3.1 Indicator Service
- [ ] Create `app/services/indicator_service.py` with functions:
  - `extract_urls(text)` — regex to find URLs
  - `extract_phone_numbers(text)` — regex for phone numbers
  - `check_urgency_keywords(text)` — match against: urgent, immediately, blocked, suspended, verify now, limited time
  - `check_financial_keywords(text)` — match against: reward, prize, money, loan, payment, fee, cash
  - `check_credential_keywords(text)` — match against: otp, pin, password, card, cvv, verification code
  - `check_payment_request(text)` — detect payment-related phrases
  - `check_impersonation(text)` — detect bank/telco name mentions in suspicious context
  - `check_suspension_threat(text)` — detect account suspension/blocking threats

### 3.2 Analysis Service
- [ ] Create `app/services/analysis_service.py` with functions:
  - `normalize_text(text)` — lowercase, strip whitespace, remove special formatting
  - `calculate_risk_score(text)` — run all indicator checks, sum scores (cap at 100), return score + matched indicators list
  - `determine_risk_level(score)` — Low (0-25), Medium (26-50), High (51-75), Critical (76-100)
  - `classify_scam_category(text, indicators)` — determine best-fit category from 9 types based on matched indicators
  - `generate_explanation(category, indicators)` — human-readable explanation of why the message is risky
  - `generate_advice(category, risk_level)` — safety recommendations
  - `analyze_message(text)` — orchestrator that calls all above and returns full result dict

### 3.3 Testing the Engine
- [ ] Test with sample messages from the spec:
  - "Your MoMo account has been blocked. Verify immediately using this link." → should score high, Mobile Money Fraud
  - "Congratulations! You have been selected for a job. Pay registration fee now." → Fake Job Scam
  - "You have won GHS 10,000. Send your PIN to claim your reward." → Fake Prize Scam

**Deliverable:** `analyze_message("...")` returns correct risk_score, risk_level, scam_category, indicators, explanation, and advice for all sample messages.

---

## Phase 4: Backend API Endpoints

**Goal:** Expose the analysis engine and dashboard stats via REST API.

### 4.1 Pydantic Schemas
- [ ] Create `app/schemas/message.py`:
  - `AnalyzeRequest` — `message: str` (min length 1, max length 5000)
  - `IndicatorResponse` — `name: str`, `score: int`
  - `AnalyzeResponse` — `risk_score`, `risk_level`, `scam_category`, `indicators`, `explanation`, `advice`
  - `DashboardStats` — `total_messages`, `high_risk_percentage`, `category_distribution` (dict), `risk_level_distribution` (dict), `common_keywords` (list)

### 4.2 Analyze Endpoint
- [ ] Create `app/api/analyze.py`:
  - `POST /api/v1/analyze` — accept `AnalyzeRequest`, call `analyze_message()`, save result + indicators to database, return `AnalyzeResponse`

### 4.3 Dashboard Endpoint
- [ ] Create `app/api/dashboard.py`:
  - `GET /api/v1/dashboard/stats` — query database for aggregate stats, return `DashboardStats`

### 4.4 Router Registration
- [ ] Create `app/api/router.py` — combine all routers under `/api/v1` prefix
- [ ] Register in `main.py`
- [ ] Add CORS middleware in `main.py` (allow frontend origin)

### 4.5 Validation & Security
- [ ] Enforce payload size limits on the analyze endpoint
- [ ] Sanitize input text (strip HTML/script tags) before processing

**Deliverable:** Both endpoints work via curl/Postman. POST /api/v1/analyze returns correct JSON response. GET /api/v1/dashboard/stats returns aggregated data.

---

## Phase 5: Frontend — Layout & Routing

**Goal:** Build the app shell, navigation, and page routing.

### 5.1 Theme & Layout
- [ ] Create MUI theme in `src/theme.js` — cybersecurity-inspired palette, dark/light mode toggle support
- [ ] Create `src/components/layout/Navbar.jsx` — AppBar with app name "CyberSafe GH", navigation links (Home, Dashboard), dark/light toggle
- [ ] Create `src/components/layout/Footer.jsx`
- [ ] Create `src/components/layout/Layout.jsx` — wraps Navbar + content + Footer

### 5.2 Routing
- [ ] Set up React Router in `App.jsx` with routes:
  - `/` → Home page
  - `/results` → Results page
  - `/dashboard` → Dashboard page

### 5.3 Context
- [ ] Create `src/context/AnalysisContext.jsx` — stores latest analysis result, provides `analyzeMessage()` function, loading state

### 5.4 API Service
- [ ] Create `src/services/api.js` — Axios instance with baseURL from env, two functions:
  - `analyzeMessage(message)` → POST /analyze
  - `getDashboardStats()` → GET /dashboard/stats

### 5.5 Utilities
- [ ] Create `src/utils/riskHelpers.js`:
  - `getRiskColor(level)` — Low→green, Medium→yellow, High→orange, Critical→red
  - `getRiskIcon(level)` — appropriate MUI icon per level

**Deliverable:** App loads with navbar, routes work, theme toggles between dark/light. No functionality yet on pages (just placeholders).

---

## Phase 6: Frontend — Home Page & Message Analyzer

**Goal:** Build the main user-facing feature — the message analyzer form.

### 6.1 Home Page
- [ ] Create `src/pages/Home.jsx`:
  - Hero section — project title, tagline ("Protect yourself from scams in Ghana"), brief description
  - CTA directing user to the analyzer form below

### 6.2 Analyzer Component
- [ ] Create `src/components/analyzer/AnalyzerForm.jsx`:
  - MUI TextField (multiline, 4-6 rows) for message input
  - Character count indicator
  - "Analyze" button (disabled when empty or loading)
  - Loading state with LinearProgress
  - On submit: call API via context, navigate to `/results`

### 6.3 Integration
- [ ] Wire AnalyzerForm to AnalysisContext
- [ ] On successful analysis, store result in context and redirect to Results page
- [ ] Handle API errors with Snackbar/Alert

**Deliverable:** User can type a message, click Analyze, see loading state, and be redirected to Results page.

---

## Phase 7: Frontend — Results Page

**Goal:** Display the full analysis result in a clear, visual format.

### 7.1 Results Page
- [ ] Create `src/pages/Results.jsx` — reads analysis result from context, shows "no data" state if accessed directly

### 7.2 Risk Components
- [ ] Create `src/components/risk/RiskScoreGauge.jsx` — circular or linear progress showing score 0-100, color-coded by risk level
- [ ] Create `src/components/risk/RiskLevelBadge.jsx` — Chip with risk level text + color
- [ ] Create `src/components/risk/ScamCategoryCard.jsx` — Card showing detected scam type with icon
- [ ] Create `src/components/risk/IndicatorList.jsx` — list of matched indicators with individual scores
- [ ] Create `src/components/risk/ExplanationCard.jsx` — Card with explanation text
- [ ] Create `src/components/risk/AdviceCard.jsx` — Card with safety advice items (as Alert components)

### 7.3 Layout
- [ ] Compose all risk components on Results page in a responsive grid layout
- [ ] Add "Analyze Another Message" button that navigates back to Home

**Deliverable:** After analysis, user sees a polished results page with risk score gauge, category, indicators, explanation, and advice — all color-coded.

---

## Phase 8: Frontend — Dashboard Page

**Goal:** Build the analytics dashboard with charts and metrics.

### 8.1 Dashboard Page
- [ ] Create `src/pages/Dashboard.jsx` — fetches stats from API on mount

### 8.2 Dashboard Components
- [ ] Create `src/components/dashboard/StatCard.jsx` — reusable metric card (icon, label, value)
- [ ] Create `src/components/dashboard/CategoryPieChart.jsx` — Recharts PieChart showing scam category distribution
- [ ] Create `src/components/dashboard/RiskBarChart.jsx` — Recharts BarChart showing risk level distribution
- [ ] Create `src/components/dashboard/TrendChart.jsx` — Recharts LineChart showing daily scan volume (requires adding a daily-stats endpoint or aggregating from existing data)

### 8.3 Layout
- [ ] Top row: stat cards (total messages, high-risk %, most common scam type)
- [ ] Bottom row: charts in a responsive grid
- [ ] Loading skeleton while data is fetching
- [ ] Empty state if no data yet

**Deliverable:** Dashboard page shows live stats and charts from the database. Works with zero data (empty state) and with data.

---

## Phase 9: Polish & Integration Testing

**Goal:** End-to-end testing, error handling, responsiveness, and final polish.

### 9.1 Error Handling
- [ ] Backend: add global exception handler in FastAPI
- [ ] Frontend: add error boundaries, handle network failures gracefully with user-friendly messages

### 9.2 Responsive Design
- [ ] Test and fix all pages on mobile, tablet, and desktop breakpoints
- [ ] Ensure analyzer form and results are usable on small screens

### 9.3 End-to-End Flow Testing
- [ ] Test full flow: submit message → see results → check dashboard updates
- [ ] Test edge cases: empty input, very long input, input with special characters, input with no risk indicators (score = 0)
- [ ] Verify all 9 scam categories can be triggered with appropriate messages

### 9.4 Performance
- [ ] Ensure API response time is under 500ms for analysis
- [ ] Add database indexes on `created_at` and `risk_level` for dashboard queries

### 9.5 Final Touches
- [ ] Add favicon and page titles
- [ ] Verify dark/light mode works across all pages
- [ ] Add loading states everywhere data is fetched

**Deliverable:** A fully functional, polished MVP that meets all success criteria from the spec.

---

## Summary

| Phase | Focus | Key Output |
|-------|-------|------------|
| 1 | Project Setup | Both apps running, folder structure in place |
| 2 | Database & Models | PostgreSQL tables created, ORM models defined |
| 3 | Risk Engine | Core detection logic working with sample messages |
| 4 | Backend API | REST endpoints live and tested |
| 5 | Frontend Shell | Layout, routing, theme, context wired up |
| 6 | Home Page | Analyzer form submits to backend |
| 7 | Results Page | Full risk analysis displayed visually |
| 8 | Dashboard | Charts and analytics from live data |
| 9 | Polish | Error handling, responsiveness, end-to-end tested |
