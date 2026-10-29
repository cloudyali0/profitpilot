"""Small Business Brain analytics engine: all calculations powered by pandas/numpy.
Deterministic, explainable business intelligence.
"""
import math
import numpy as np
import pandas as pd
from . import db

LEAD_DAYS = 3       # Supplier lead time in days
COVER_DAYS = 7      # Target buffer stock in days
DEAD_DAYS = 30      # Threshold for dead stock
TARGET_MARGIN = 0.10
FIXED = {"rent", "salary", "electricity"}


def load():
    p = db.read("select * from products")
    if len(p) == 0:
        from . import seed
        seed.build()
        p = db.read("select * from products")

    s = db.read("select * from sales")
    e = db.read("select * from expenses")
    if len(s):
        s["date"] = pd.to_datetime(s["date"])
    else:
        s["date"] = pd.Series(dtype="datetime64[ns]")
    if len(e):
        e["date"] = pd.to_datetime(e["date"])
    else:
        e["date"] = pd.Series(dtype="datetime64[ns]")
    as_of = s["date"].max() if len(s) else pd.Timestamp.today().normalize()
    return p, s, e, as_of


def forecast(p, s, as_of):
    """Weighted 14d/28d average x weekday pattern -> next 7 days demand."""
    if len(p) == 0:
        return pd.DataFrame(columns=["daily", "f7"])
    s = s[s["date"] <= as_of]
    ids = p["id"]
    d14 = (s[s["date"] > as_of - pd.Timedelta(days=14)].groupby("product_id")["qty"].sum() / 14).reindex(ids).fillna(0)
    d28 = (s[s["date"] > as_of - pd.Timedelta(days=28)].groupby("product_id")["qty"].sum() / 28).reindex(ids).fillna(0)
    base = 0.6 * d14 + 0.4 * d28
    tot = s[s["date"] > as_of - pd.Timedelta(days=56)].groupby("date")["qty"].sum()
    if len(tot):
        tot = tot.reindex(pd.date_range(tot.index.min(), as_of)).fillna(0)
        wd = tot.groupby(tot.index.weekday).mean()
        fac = (wd / wd.mean()).to_dict() if wd.mean() else {}
    else:
        fac = {}
    wsum = sum(fac.get((as_of + pd.Timedelta(days=i)).weekday(), 1.0) for i in range(1, 8))
    out = pd.DataFrame({"daily": base.values, "f7": (base * wsum).values}, index=ids.values)
    return out


def backtest(days=7):
    p, s, e, as_of = load()
    cutoff = as_of - pd.Timedelta(days=days)
    f = forecast(p, s, cutoff)
    actual = s[(s["date"] > cutoff) & (s["date"] <= as_of)].groupby("product_id")["qty"].sum().reindex(f.index).fillna(0)
    err = (f["f7"] - actual).abs().sum()
    wape = err / actual.sum() if actual.sum() else 0
    return {
        "window_days": days,
        "predicted_units": round(float(f["f7"].sum())),
        "actual_units": int(actual.sum()),
        "accuracy_pct": round(float(max(0, 1 - wape)) * 100, 1)
    }


def stock_insights():
    p, s, e, as_of = load()
    cols = [
        "product_id", "name", "category", "unit", "cp", "sp", "stock",
        "daily_demand", "forecast_7d", "days_left", "days_since_last_sale",
        "qty_30d", "revenue_30d", "profit_30d", "margin_pct", "locked_cash"
    ]
    if len(p) == 0:
        return pd.DataFrame(columns=cols), as_of

    f = forecast(p, s, as_of)
    d30 = s[s["date"] > as_of - pd.Timedelta(days=30)].groupby("product_id")["qty"].sum()
    last = s.groupby("product_id")["date"].max()
    rows = []
    for _, r in p.iterrows():
        pid = r["id"]
        daily = float(f.loc[pid, "daily"]) if pid in f.index else 0.0
        f7 = float(f.loc[pid, "f7"]) if pid in f.index else 0.0
        q30 = int(d30.get(pid, 0))
        days_since = int((as_of - last[pid]).days) if pid in last.index else 999
        days_left = (r["stock"] / daily) if daily > 0.05 else None
        margin = (r["sp"] - r["cp"]) / r["sp"] if r["sp"] else 0
        rows.append(dict(
            product_id=int(pid),
            name=r["name"],
            category=r["category"],
            unit=r["unit"],
            cp=float(r["cp"]),
            sp=float(r["sp"]),
            stock=int(r["stock"]),
            daily_demand=round(daily, 2),
            forecast_7d=round(f7, 1),
            days_left=None if days_left is None else round(days_left, 1),
            days_since_last_sale=days_since,
            qty_30d=q30,
            revenue_30d=round(q30 * r["sp"], 2),
            profit_30d=round(q30 * (r["sp"] - r["cp"]), 2),
            margin_pct=round(margin * 100, 1),
            locked_cash=round(r["stock"] * r["cp"], 2)
        ))
    return pd.DataFrame(rows, columns=cols), as_of


def expense_insights():
    p, s, e, as_of = load()
    if len(e) == 0:
        return []
    last7 = e[e["date"] > as_of - pd.Timedelta(days=7)].groupby("category")["amount"].sum()
    prior = e[(e["date"] <= as_of - pd.Timedelta(days=7)) & (e["date"] > as_of - pd.Timedelta(days=35))].groupby("category")["amount"].sum() / 4
    out = []
    for cat in sorted(set(last7.index) | set(prior.index)):
        l = float(last7.get(cat, 0))
        a = float(prior.get(cat, 0))
        ratio = (l / a) if a else None
        out.append(dict(
            category=cat,
            last_7d=round(l, 2),
            normal_weekly=round(a, 2),
            ratio=None if ratio is None else round(ratio, 2),
            anomaly=bool(cat not in FIXED and a and ratio >= 1.4 and l - a >= 200)
        ))
    return out


def recommendations():
    ins, as_of = stock_insights()
    recs = []
    for _, r in ins.iterrows():
        # 1. Reorder Alert
        if r["daily_demand"] > 0.5 and r["days_left"] is not None and r["days_left"] <= LEAD_DAYS + 2:
            qty = max(1, math.ceil(r["daily_demand"] * COVER_DAYS - r["stock"]))
            at_risk = max(0, r["forecast_7d"] - r["stock"]) * r["sp"]
            recs.append(dict(
                type="reorder",
                urgency="high" if r["days_left"] <= LEAD_DAYS else "medium",
                product_id=r["product_id"],
                title=f"{r['name']}: {r['days_left']:.1f} din me khatam",
                detail=f"Roz ~{r['daily_demand']:.0f} bikta hai, stock sirf {r['stock']} {r['unit']}. Aaj {qty} {r['unit']} mangao.",
                action=f"Reorder {qty}",
                impact_rs=round(at_risk)
            ))
        # 2. Dead Stock Alert
        if r["days_since_last_sale"] >= DEAD_DAYS and r["stock"] > 0:
            d = "kabhi nahi" if r["days_since_last_sale"] >= 999 else f"{r['days_since_last_sale']} din se"
            recs.append(dict(
                type="dead_stock",
                urgency="medium",
                product_id=r["product_id"],
                title=f"{r['name']}: {d} nahi bika",
                detail=f"₹{r['locked_cash']:,.0f} ka maal shelf par phasa hai. 10-15% discount ya bundle lagao.",
                action="Discount / Bundle",
                impact_rs=round(r["locked_cash"])
            ))
    # 3. Margin Leak
    top = ins[ins["qty_30d"] > 0]
    if len(top):
        thr = top["revenue_30d"].median()
        for _, r in top[(top["margin_pct"] < 8) & (top["revenue_30d"] >= thr)].iterrows():
            need = r["cp"] / (1 - TARGET_MARGIN)
            delta = max(1, math.ceil(need - r["sp"]))
            recs.append(dict(
                type="margin_leak",
                urgency="medium",
                product_id=r["product_id"],
                title=f"{r['name']}: sirf {r['margin_pct']:.1f}% margin",
                detail=f"Mahine me {r['qty_30d']} bika par profit bas ₹{r['profit_30d']:,.0f}. Rate ₹{delta} badhane ya supplier switch se ~₹{r['qty_30d']*delta:,.0f}/month bachega.",
                action=f"Price +₹{delta}",
                impact_rs=round(r["qty_30d"] * delta)
            ))
    # 4. Expense Anomaly
    for x in expense_insights():
        if x["anomaly"]:
            recs.append(dict(
                type="expense_anomaly",
                urgency="medium",
                product_id=None,
                title=f"{x['category'].title()} kharcha {x['ratio']:.1f}x badha",
                detail=f"Is hafte ₹{x['last_7d']:,.0f} (normal ~₹{x['normal_weekly']:,.0f}). Kharabi / wastage audit karein.",
                action="Investigate",
                impact_rs=round(x["last_7d"] - x["normal_weekly"])
            ))
    order = {"high": 0, "medium": 1, "low": 2}
    recs.sort(key=lambda r: (order.get(r["urgency"], 3), -r["impact_rs"]))
    for i, r in enumerate(recs, 1):
        r["id"] = i
    return recs


def overview():
    ins, as_of = stock_insights()
    p, s, e, _ = load()
    c = lambda x: min(1.0, max(0.0, x))
    rev30 = float(ins["revenue_30d"].sum()) if len(ins) else 0.0
    gp30 = float(ins["profit_30d"].sum()) if len(ins) else 0.0
    exp30 = float(e[e["date"] > as_of - pd.Timedelta(days=30)]["amount"].sum()) if len(e) else 0.0
    inv_val = float(ins["locked_cash"].sum()) if len(ins) else 0.0
    dead_locked = float(ins[(ins["days_since_last_sale"] >= DEAD_DAYS)]["locked_cash"].sum()) if len(ins) else 0.0
    sellers = ins[ins["daily_demand"] > 0.5] if len(ins) else pd.DataFrame()
    at_risk = int((sellers["days_left"].fillna(99) <= LEAD_DAYS + 2).sum()) if len(sellers) else 0
    margin = gp30 / rev30 if rev30 else 0
    exp_ratio = exp30 / rev30 if rev30 else 0
    comp = {
        "stock_availability": round(25 * (1 - c(at_risk / max(1, len(sellers)) / 0.5)), 1) if len(sellers) else 25.0,
        "dead_stock": round(25 * (1 - c((dead_locked / inv_val if inv_val else 0) / 0.25)), 1),
        "margin": round(25 * c(margin / 0.18), 1),
        "expense_control": round(25 * (1 - c((exp_ratio - 0.08) / 0.12)), 1),
    }
    yday = s[s["date"] == as_of].merge(p, left_on="product_id", right_on="id") if len(s) and len(p) else pd.DataFrame()
    last_day_sales = round(float((yday["qty"] * yday["sp"]).sum())) if len(yday) else 0

    return dict(
        as_of=as_of.date().isoformat() if hasattr(as_of, "date") else str(as_of),
        health_score=round(sum(comp.values())),
        score_breakdown=comp,
        revenue_30d=round(rev30),
        gross_profit_30d=round(gp30),
        margin_pct=round(margin * 100, 1),
        expenses_30d=round(exp30),
        net_profit_30d=round(gp30 - exp30),
        last_day_sales=last_day_sales,
        inventory_value=round(inv_val),
        dead_stock_locked=round(dead_locked),
        products_at_risk=at_risk
    )


def weekly_finance(weeks=8):
    ins, as_of = stock_insights()
    p, s, e, _ = load()
    if len(s) and len(p):
        s = s.merge(p[["id", "cp", "sp"]], left_on="product_id", right_on="id")
    out = []
    for w in range(weeks - 1, -1, -1):
        end = as_of - pd.Timedelta(days=7 * w)
        start = end - pd.Timedelta(days=7)
        sw = s[(s["date"] > start) & (s["date"] <= end)] if len(s) else pd.DataFrame()
        rev = float((sw["qty"] * sw["sp"]).sum()) if len(sw) else 0.0
        gp = float((sw["qty"] * (sw["sp"] - sw["cp"])).sum()) if len(sw) else 0.0
        ex = float(e[(e["date"] > start) & (e["date"] <= end)]["amount"].sum()) if len(e) else 0.0
        out.append(dict(
            week_ending=end.date().isoformat() if hasattr(end, "date") else str(end),
            revenue=round(rev),
            gross_profit=round(gp),
            expenses=round(ex),
            net=round(gp - ex)
        ))
    cat = {}
    if len(e):
        cat = e[e["date"] > as_of - pd.Timedelta(days=30)].groupby("category")["amount"].sum().round().to_dict()
    return {"weekly": out, "expense_by_category_30d": cat}


def hinglish_summary():
    o = overview()
    recs = recommendations()
    lines = [
        f"🏪 Small Business Brain — {o['as_of']}",
        f"Health Score: {o['health_score']}/100",
        f"Kal ki bikri ₹{o['last_day_sales']:,} | 30 din ka net profit ₹{o['net_profit_30d']:,}",
        "",
        "Aaj ke top 3 kaam:"
    ]
    for i, r in enumerate(recs[:3], 1):
        lines.append(f"{i}. {r['title']} — {r['detail']}")
    return "\n".join(lines)
