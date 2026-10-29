import os
import json
import httpx
from . import engine


def _rule_based(q, o, recs):
    t = q.lower()
    pick = lambda ty: [r for r in recs if r["type"] == ty]

    def fmt(rs):
        return "\n".join(f"• {r['title']} — {r['detail']}" for r in rs[:4]) or "Abhi koi urgent issue nahi hai."

    if any(w in t for w in ("mangau", "reorder", "khatam", "stock", "order", "supply")):
        return "📦 Ye items jaldi khatam ho rahe hain (urgent reorder chahiye):\n" + fmt(pick("reorder"))
    if any(w in t for w in ("dead", "nahi bik", "phasa", "slow", "pada", "purana")):
        return f"🔒 ₹{o['dead_stock_locked']:,} ka maal shelf par phasa hai (dead stock):\n" + fmt(pick("dead_stock"))
    if any(w in t for w in ("margin", "rate", "price", "daam", "munafa")):
        return "📉 In products par margin kam mil raha hai:\n" + fmt(pick("margin_leak"))
    if any(w in t for w in ("kharcha", "expense", "kharch", "bill", "wastage")):
        return "⚠️ Kharche me ye badhotari dikhi hai:\n" + fmt(pick("expense_anomaly"))
    if any(w in t for w in ("profit", "kamai", "nafa", "p&l", "revenue")):
        return (
            f"📊 Pichle 30 Din Ka Report:\n"
            f"• Kul Bikri: ₹{o['revenue_30d']:,}\n"
            f"• Gross Profit: ₹{o['gross_profit_30d']:,} ({o['margin_pct']}% margin)\n"
            f"• Kharche: ₹{o['expenses_30d']:,}\n"
            f"• Net Profit: ₹{o['net_profit_30d']:,}\n"
            f"• Kal ki sales: ₹{o['last_day_sales']:,}"
        )
    return engine.hinglish_summary()


def ask(q):
    o = engine.overview()
    recs = engine.recommendations()
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return {"answer": _rule_based(q, o, recs), "source": "rules"}

    ctx = json.dumps({
        "overview": o,
        "recommendations": recs[:10],
        "expenses": engine.expense_insights()
    }, ensure_ascii=False)

    prompt = (
        "Tum 'Small Business Brain' ho - ek smart retail advisor for kirana stores. "
        "SIRF diye gaye data ke actual numbers use karo, koi bhi man-ghadant number mat banao. "
        "Hinglish me chhota, clear aur actionable jawab do. Rupees (₹) me impact zaroor batao.\n\n"
        f"DATA: {ctx}\n\n"
        f"SAWAL: {q}"
    )
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    try:
        r = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            params={"key": key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=15
        )
        r.raise_for_status()
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return {"answer": text, "source": "gemini"}
    except Exception:
        return {"answer": _rule_based(q, o, recs), "source": "rules-fallback"}
