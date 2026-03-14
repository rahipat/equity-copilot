# Equity Research Copilot

AI-powered stock research platform. Enter any US ticker and get real financials, a 90-day price chart, and an AI-generated analyst report with bull/bear cases, factor scores, and catalysts.

**Stack:** FastAPI · React + Vite · Recharts · Polygon.io (Massive) · Claude AI

---

## Project Structure

```
equity-copilot/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── components/
    │       ├── SearchBar.jsx
    │       ├── EmptyState.jsx
    │       ├── LoadingState.jsx
    │       ├── PriceChart.jsx
    │       └── Report.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your keys:
#   POLYGON_API_KEY=your_massive_key
#   ANTHROPIC_API_KEY=your_anthropic_key

# Run
uvicorn main:app --reload
# API live at http://localhost:8000
```

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
# App live at http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so no CORS issues.

---

## Environment Variables

| Variable | Description |
|---|---|
| `POLYGON_API_KEY` | Your Massive/Polygon.io API key |
| `ANTHROPIC_API_KEY` | Your Anthropic Claude API key |

Never commit your `.env` file. It's already in `.gitignore`.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/analyze/{ticker}` | Full research report for a ticker |
| GET | `/api/health` | Health check |

---

## Deployment

### Backend → Railway
```bash
# In backend/ directory
railway init
railway up
railway variables set POLYGON_API_KEY=... ANTHROPIC_API_KEY=...
```

### Frontend → Vercel
```bash
# In frontend/ directory — set VITE_API_URL to your Railway URL
vercel deploy
```

Update `vite.config.js` proxy target to your Railway URL for production builds, or use `VITE_API_URL` env var:

```js
// vite.config.js
proxy: {
  '/api': process.env.VITE_API_URL || 'http://localhost:8000'
}
```

---

## Notes

- Polygon basic tier provides end-of-day pricing (not real-time) — perfect for research use
- Claude AI supplements missing fields (P/E, EPS, beta) based on known fundamentals
- Rate limits: Polygon basic = 5 calls/min, Anthropic = varies by tier
