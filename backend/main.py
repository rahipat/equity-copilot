from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import json
import asyncio
from datetime import date, timedelta
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Equity Research Copilot API")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

POLYGON_KEY = os.getenv("POLYGON_API_KEY", "")
POLYGON_BASE = "https://api.polygon.io"

anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


async def polygon_get(path: str, params: dict = None):
    if params is None:
        params = {}
    params["apiKey"] = POLYGON_KEY
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{POLYGON_BASE}{path}", params=params)
        r.raise_for_status()
        return r.json()


@app.get("/api/analyze/{ticker}")
async def analyze(ticker: str):
    ticker = ticker.upper().strip()

    try:
        to_date = date.today().isoformat()
        from_date = (date.today() - timedelta(days=90)).isoformat()

        snapshot, details, financials, aggs = await _fetch_all(ticker, from_date, to_date)

        t = snapshot.get("ticker", {})
        if not t:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

        day = t.get("day", {})
        prev_day = t.get("prevDay", {})
        price = day.get("c") or prev_day.get("c") or 0
        change = round(price - (prev_day.get("c") or price), 2)
        change_pct = round((change / prev_day.get("c")) * 100, 2) if prev_day.get("c") else 0.0
        volume = day.get("v", 0)

        det = details.get("results", {})
        market_cap = det.get("market_cap")
        market_cap_str = f"{round(market_cap/1e9, 1)}B" if market_cap else "N/A"

        fins = financials.get("results", [])
        latest = fins[-1] if fins else {}
        prev = fins[-2] if len(fins) > 1 else {}
        ic = latest.get("financials", {}).get("income_statement", {})
        ic_prev = prev.get("financials", {}).get("income_statement", {})
        bs = latest.get("financials", {}).get("balance_sheet", {})

        rev = ic.get("revenues", {}).get("value")
        rev_prev = ic_prev.get("revenues", {}).get("value")
        rev_str = f"{round(rev/1e9, 1)}B" if rev else "N/A"
        rev_growth = round(((rev - rev_prev) / rev_prev) * 100, 1) if (rev and rev_prev) else None
        gross_profit = ic.get("gross_profit", {}).get("value")
        gross_margin = round((gross_profit / rev) * 100, 1) if (gross_profit and rev) else None
        net_income = ic.get("net_income_loss", {}).get("value")
        net_income_str = f"{round(net_income/1e9, 1)}B" if net_income else "N/A"

        total_assets = bs.get("assets", {}).get("value")
        total_liabilities = bs.get("liabilities", {}).get("value")
        equity = (total_assets - total_liabilities) if (total_assets and total_liabilities) else None
        long_term_debt = bs.get("long_term_debt", {}).get("value")
        debt_to_equity = round(long_term_debt / equity, 2) if (long_term_debt and equity and equity > 0) else None

        agg_results = aggs.get("results", [])
        chart_dates = [r["t"] for r in agg_results]
        chart_prices = [r["c"] for r in agg_results]
        high_52 = round(max(chart_prices), 2) if chart_prices else None
        low_52 = round(min(chart_prices), 2) if chart_prices else None

        fundamental_data = {
            "ticker": ticker,
            "companyName": det.get("name", ticker),
            "description": det.get("description", ""),
            "sector": det.get("sic_description", ""),
            "homepageUrl": det.get("homepage_url", ""),
            "price": round(price, 2),
            "change": change,
            "changePct": change_pct,
            "volume": volume,
            "marketCap": market_cap_str,
            "revenue": rev_str,
            "revenueGrowth": rev_growth,
            "grossMargin": f"{gross_margin}%" if gross_margin else "N/A",
            "netIncome": net_income_str,
            "debtToEquity": debt_to_equity,
            "fiftyTwoWeekHigh": high_52,
            "fiftyTwoWeekLow": low_52,
        }

        ai_analysis = await _run_ai_analysis(fundamental_data)

        return {
            **fundamental_data,
            **ai_analysis,
            "chartDates": chart_dates,
            "chartPrices": chart_prices,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _fetch_all(ticker, from_date, to_date):
    return await asyncio.gather(
        polygon_get(f"/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}"),
        polygon_get(f"/v3/reference/tickers/{ticker}"),
        polygon_get("/vX/reference/financials", {"ticker": ticker, "limit": 4, "sort": "filing_date"}),
        polygon_get(f"/v2/aggs/ticker/{ticker}/range/1/day/{from_date}/{to_date}", {"adjusted": "true", "sort": "asc", "limit": 120}),
    )


async def _run_ai_analysis(data: dict) -> dict:
    prompt = f"""You are a senior equity research analyst. Given these real financials for {data['ticker']}, generate a research report.

DATA:
{json.dumps(data, indent=2)}

Respond ONLY with a valid JSON object (no markdown, no backticks):
{{
  "rating": "BUY" or "HOLD" or "SELL",
  "priceTarget": number,
  "peRatio": number or null,
  "forwardPE": number or null,
  "eps": number or null,
  "beta": number or null,
  "dividendYield": number or null,
  "summary": "3-4 sentence investment thesis referencing the real data",
  "bullCase": ["point 1", "point 2", "point 3"],
  "bearCase": ["point 1", "point 2", "point 3"],
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "scores": {{"growth": 0-100, "profitability": 0-100, "valuation": 0-100, "momentum": 0-100}},
  "news": [
    {{"headline": "realistic recent headline", "source": "WSJ", "sentiment": "positive"}},
    {{"headline": "realistic recent headline", "source": "Bloomberg", "sentiment": "neutral"}},
    {{"headline": "realistic recent headline", "source": "Reuters", "sentiment": "negative"}}
  ]
}}"""

    message = anthropic.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = message.content[0].text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "polygon_key_set": bool(POLYGON_KEY),
        "anthropic_key_set": bool(os.getenv("ANTHROPIC_API_KEY"))
    }
