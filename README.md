# Small Business Brain

### *Roz subah 3 sahi faisle, seedha munafa.*

[![Stack](https://img.shields.io/badge/FastAPI-React_19-0F766E)](#tech-stack)
[![Analytics](https://img.shields.io/badge/Engine-Pandas%20%7C%20NumPy-0284C7)](#engine-formulas)
[![Language](https://img.shields.io/badge/NLP-Hinglish%20%7C%20Hindi%20%7C%20English-ready-059669)](#ask-brain-ai-advisor)
[![Forecast Accuracy](https://img.shields.io/badge/Forecast%20Accuracy-86.9%25-22C55E)](#backtest-verification)
[![License](https://img.shields.io/badge/License-MIT-gray)](LICENSE)

> India has millions of kirana stores and small retailers. Most store owners manage inventory and daily financial decisions purely on memory and intuition. Fast-moving items run out causing lost sales, slow-moving items freeze valuable working capital, and variable expense leaks go unnoticed.  
> **Small Business Brain is the intelligence engine for retail:** Every morning, it delivers exactly 3 prioritized, high-impact business decisions with transparent Rupee (₹) impacts calculated deterministically with pandas.

---

## Key Differentiators

| Traditional Retail / Ledger Apps | Small Business Brain |
| --- | --- |
| Record-keeping only (Khatabook/Vyapar style) | **Decision Engine:** Tells the merchant *what to do today* with quantified ₹ impact. |
| Black-box ML or LLM-hallucinated figures | **Deterministic pandas/numpy math:** Every number is calculated directly from ledger transactions. |
| English-only, complex desktop dashboards | **Mobile-first, Hinglish native:** Full voice input & conversational queries in colloquial Hindi/Hinglish. |
| Static inventory threshold warnings | **Dynamic 7-Day Demand Forecasting:** Weighted 14d/28d trends modulated by weekday seasonality factors. |
| Manual, tedious form inputs | **Natural Language Quick Entry:** Type `"2 atta becha"` or `"bijli bill 1800 diya"` for instant ledger updates. |

---

## Architecture Overview

```
 ┌───────────────────────────────────────────────────────────────┐
 │               MERCHANT INTERACTION (MOBILE / WEB)             │
 │  Hinglish Chat · Voice Mic (Web Speech) · Quick Entry · CSV  │
 └───────────────────────────────┬───────────────────────────────┘
                                 │ REST API
 ┌───────────────────────────────▼───────────────────────────────┐
 │                       FASTAPI BACKEND                         │
 │                                                               │
 │  ┌─────────────────────────────────────────────────────────┐  │
 │  │                  PANDAS ANALYTICS ENGINE                │  │
 │  │  • 7-Day Demand Forecasting (14d/28d + Day-of-Week)    │  │
 │  │  • Days-of-Stock-Left & Dynamic Reorder Engine          │  │
 │  │  • Dead Stock Identification & Frozen Capital Tracker  │  │
 │  │  • Low-Margin Leakage Detector (<8% vs Target 10%)     │  │
 │  │  • Expense Anomaly Detector (1.4x 4-Week Baseline)      │  │
 │  │  • 100-Point Store Health Score & Breakdown            │  │
 │  └────────────────────────────┬────────────────────────────┘  │
 │                               │                               │
 │  ┌────────────────────────────▼────────────────────────────┐  │
 │  │               HINGLISH AI ADVISOR & NLP PARSER          │  │
 │  │  • Quick Entry Parser ("2 atta becha", "bijli bill")    │  │
 │  │  • Gemini AI Explanation + Deterministic Rules Fallback│  │
 │  └────────────────────────────┬────────────────────────────┘  │
 └───────────────────────────────┼───────────────────────────────┘
                                 │
 ┌───────────────────────────────▼───────────────────────────────┐
 │                      SQLITE DATA REPOSITORY                   │
 │           products (cp, sp, stock) · sales · expenses         │
 └───────────────────────────────────────────────────────────────┘
```

---

## The 5 Core Mobile-First Screens

### 1. Home (Store Health & Daily Decisions)
- **Health Score Gauge (0-100):** Real-time composite score balancing:
  - *Stock Availability* (25 pts)
  - *Dead Stock Recovery* (25 pts)
  - *Margin Health* (25 pts)
  - *Expense Control* (25 pts)
- **Aaj Ke Top 3 Kaam:** Ranked actionable decisions sorted by urgency and Rupee impact.
- **30-Day Financial Strip:** Live P&L metrics (Sales, Gross Profit, Expenses, Net Profit, Dead Stock locked).
- **Daily Morning Briefing:** Formatted Hinglish summary ready to copy or push to WhatsApp/Telegram.

### 2. Stock Brain (Inventory Intelligence)
- **Filter Tabs:** `All Items`, `⚠️ Reorder Now (≤5 days left)`, `📦 Dead Stock (30+ days)`, `📉 Low Margin (<8%)`.
- **Per-SKU Metrics:** Current stock, days left (Red/Amber/Green status badges), 7-day demand forecast, daily velocity, selling price, cost price, gross margin %, and locked capital.
- **Action Triggers:** 1-click PO creation, discount tags, and price optimization suggestions.

### 3. Money (Finance & Anomaly Detection)
- **8-Week Financial Trend Chart:** Interactive multi-bar visualization comparing Revenue, Gross Profit, Expenses, and Net Profit week-by-week.
- **30-Day Expense Distribution:** Category-wise breakdown (Rent, Salary, Electricity, Transport, Wastage, Misc).
- **Automated Anomaly Alerts:** Flags sudden spikes in variable overhead (e.g. wastage jumping 13x over normal weekly baseline).

### 4. Ask Brain (Conversational Advisor)
- **Bilingual Hinglish Voice & Text:** Query stock status, profit dips, or reorder needs naturally.
- **Speech Recognition:** Built-in Web Speech API supporting Hindi (`hi-IN`) and English (`en-IN`).
- **Explainability Badges:** Clearly labels whether insights are generated via `Gemini AI` or the `Pandas Engine`.

### 5. Add Data (Store Ingestion Hub)
- **Hinglish Quick Entry:** Natural language updates (e.g., `"2 atta becha"`, `"50 maggi aaya"`, `"bijli bill 1800 diya"`).
- **CSV Data Ingestion:** Dedicated upload streams for Products, Sales, and Expenses with downloadable sample CSV templates.
- **Simulation Seeder:** One-click reset to load a full 60-day simulated kirana store dataset.

---

## Engine Formulas & Mathematical Models

| Analytics Rule | Formula | Output |
| --- | --- | --- |
| **Daily Demand Velocity** | $\text{base} = 0.6 \times \text{avg}_{14\text{d}} + 0.4 \times \text{avg}_{28\text{d}}$ | Units / Day |
| **7-Day Demand Forecast** | $f_7 = \text{base} \times \sum_{i=1}^{7} \text{weekday\_factor}_i$ | `forecast_7d` |
| **Days of Stock Remaining** | $\text{days\_left} = \frac{\text{stock}}{\text{daily\_demand}}$ | `days_left` (Red: $\le 3$d, Yellow: $\le 5$d) |
| **Smart Reorder Trigger** | If $\text{days\_left} \le 5 \implies \text{qty} = \lceil\text{daily} \times 7 - \text{stock}\rceil$ | Reorder card + ₹ sales at risk |
| **Dead Stock Identification** | $\text{days\_since\_last\_sale} \ge 30 \land \text{stock} > 0$ | Locked cash = $\text{stock} \times \text{CP}$ |
| **Margin Leakage** | $\text{margin} < 8\% \land \text{revenue}_{30\text{d}} \ge \text{median}$ | Target $10\%$ SP delta + ₹ monthly upside |
| **Expense Anomaly** | $\frac{\text{last\_7d}}{\text{4wk\_weekly\_avg}} \ge 1.4 \land \Delta \ge \text{₹}200$ (variable only) | Category Anomaly Alert |
| **Store Health Score** | $\text{Availability}(25) + \text{DeadStock}(25) + \text{Margin}(25) + \text{Expense}(25)$ | $0 - 100$ Composite Index |
| **Forecast Backtest Accuracy** | $\text{Accuracy} = 1 - \text{WAPE} = 1 - \frac{\sum |f_7 - \text{actual}|}{\sum \text{actual}}$ | **86.9%** (Tested against 60-day baseline) |

---

## 12 REST API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service status, active provider, and engine health |
| `GET` | `/api/overview` | Store Health Score, 4-pillar breakdown, and 30-day KPIs |
| `GET` | `/api/recommendations` | Ranked actionable decisions with Rupee impact |
| `GET` | `/api/inventory` | SKU-level stock, days left, forecast, and locked cash |
| `GET` | `/api/finance` | 8-week financial trends (Revenue, GP, Expenses, Net) |
| `GET` | `/api/expenses` | Category breakdown & baseline anomaly detection |
| `GET` | `/api/forecast/backtest` | 7-day cutoff WAPE accuracy score |
| `GET` | `/api/summary` | Daily morning Hinglish briefing text |
| `POST` | `/api/chat` | Conversational query (`{"text": "Is hafte kya mangau?"}`) |
| `POST` | `/api/quick-entry` | Natural language entry (`{"text": "2 atta becha"}`) |
| `POST` | `/api/upload/{kind}` | CSV upload (`products`, `sales`, `expenses`) |
| `POST` | `/api/seed/reset` | Resets and rebuilds the 60-day kirana simulation |

---

## Tech Stack

- **Backend:** Python 3.14+, FastAPI, Pandas, NumPy, Pydantic v2, SQLite, HTTPX
- **Frontend:** React 19, TypeScript, Vite, React Router v7, Responsive SVG Data Visualizations
- **AI & NLP:** Gemini 2.5 Flash / Free Tier + Deterministic Hinglish Natural Language Fallback
- **Speech Engine:** Web Speech API (Native browser speech-to-text with Hindi/English support)

---

## Local Setup & Quickstart

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## License

This project is licensed under the [MIT License](LICENSE).
