import os
import json
import httpx
from . import engine


def _rule_based(q, o, recs):
    t = q.lower().strip()
    pick = lambda ty: [r for r in recs if r["type"] == ty]

    def fmt(rs):
        return "\n".join(f"• {r['title']} — {r['detail']}" for r in rs[:4]) or "Abhi koi urgent issue nahi hai."

    # Greeting
    if any(t == g or t.startswith(g + " ") for g in ("hi", "hello", "namaste", "pranam", "hey")):
        return (
            "🙏 Namaste! Main Small Business Brain hoon.\n"
            "Aap mujhse pooch sakte hain:\n"
            "• 'Is hafte kya mangau?'\n"
            "• 'Atta ka stock kab khatam hoga?'\n"
            "• 'Kahan paisa phasa hai?'\n"
            "• 'Profit kyu gira?'\n"
            "• 'Store health score kya hai?'"
        )

    # Product-specific enquiry (e.g. "atta", "maggi", "oil", "tel", "sugar", etc.)
    ins, _ = engine.stock_insights()
    for _, item in ins.iterrows():
        pname = item["name"].lower()
        key_words = [w for w in pname.split() if len(w) > 3 and not w.endswith(("kg", "gm", "ml", "g", "l"))]
        if any(w in t for w in key_words) or (item["category"].lower() in t):
            dl = f"{item['days_left']:.1f} din" if item['days_left'] is not None else "Khatam / Bik nahi raha"
            status = "⚠️ Urgent Reorder Chahiye" if (item['days_left'] is not None and item['days_left'] <= 5) else "✅ Stock Normal Hai"
            return (
                f"📦 **{item['name']}**:\n"
                f"• Current Stock: {int(item['stock'])} {item['unit']}\n"
                f"• Rozana Bikri: ~{item['daily_demand']:.1f} {item['unit']}/din\n"
                f"• Stock Bacha Hai: {dl}\n"
                f"• Agle 7 Din Ka Forecast: ~{int(item['forecast_7d'])} {item['unit']}\n"
                f"• Status: {status}"
            )

    # Health score
    if any(w in t for w in ("health", "score", "overall")):
        b = o.get("score_breakdown", {})
        return (
            f"🏥 **Store Health Score: {o['health_score']}/100**\n"
            f"• Stock Availability: {b.get('stock_availability', 0)}/25\n"
            f"• Dead Stock Recovery: {b.get('dead_stock', 0)}/25\n"
            f"• Margin Health: {b.get('margin', 0)}/25\n"
            f"• Expense Control: {b.get('expense_control', 0)}/25\n"
            f"Net Profit (30d): ₹{o['net_profit_30d']:,}"
        )

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
    ai_provider = os.getenv("AI_PROVIDER", "").lower()
    if ai_provider == "mock":
        return {"answer": _rule_based(q, o, recs), "source": "rules"}

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
    model = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    try:
        r = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            params={"key": key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=3.5
        )
        if r.status_code == 200:
            data = r.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return {"answer": parts[0]["text"], "source": "gemini"}
    except Exception:
        pass

    return {"answer": _rule_based(q, o, recs), "source": "rules-fallback"}
