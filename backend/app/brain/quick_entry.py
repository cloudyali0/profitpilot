"""Hinglish quick entry engine:
Parses conversational entries:
- Sales: '2 atta becha', '3 maggi bika'
- Restock: '50 maggi aaya', '10 oil restock'
- Expenses: 'bijli bill 1800 diya', 'auto bhada 350', 'wastage 200'
"""
import re
from datetime import date
from . import db

SALE = ("becha", "bech", "bika", "sold", "sale", "gaya")
RESTOCK = ("aaya", "aaye", "mangaya", "restock", "received", "stock add", "khareeda")
EXP_MAP = {
    "electricity": ("bijli", "electricity", "light", "power"),
    "rent": ("kiraya", "rent", "dukaan"),
    "salary": ("salary", "tankhwah", "naukar", "helper", "chhotu"),
    "transport": ("transport", "bhada", "auto", "dhulai", "tempo", "freight"),
    "wastage": ("kharab", "wastage", "waste", "expire", "damage", "sada"),
    "misc": ("chai", "nasta", "kharcha", "misc", "dukaan ka samman")
}


def _match_product(text):
    p = db.read("select * from products")
    if len(p) == 0:
        return None
    toks = set(re.findall(r"[a-z0-9']+", text.lower()))
    best, score = None, 0
    for _, r in p.iterrows():
        nt = set(re.findall(r"[a-z0-9']+", r["name"].lower()))
        sc = len(toks & nt)
        if sc > score:
            best, score = r, sc
    return best


def process(text):
    t = text.lower()
    nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", t)]
    today = date.today().isoformat()

    # 1. Product Restock or Sale
    if any(w in t for w in RESTOCK) or any(w in t for w in SALE):
        prod = _match_product(t)
        if prod is None:
            return {"ok": False, "message": "Product samajh nahi aaya. Kripya naam spasht likhein (jaise 'atta', 'maggi')."}
        qty = int(nums[0]) if nums else 1
        pid = int(prod["id"])

        if any(w in t for w in RESTOCK):
            db.execute("UPDATE products SET stock = stock + ? WHERE id = ?", (qty, pid))
            return {
                "ok": True,
                "type": "restock",
                "message": f"✅ {prod['name']} me {qty} {prod['unit']} stock add hua! (Naya stock: {int(prod['stock']) + qty})"
            }

        # Sale
        db.execute("INSERT INTO sales(date, product_id, qty) VALUES(?, ?, ?)", (today, pid, qty))
        db.execute("UPDATE products SET stock = max(stock - ?, 0) WHERE id = ?", (qty, pid))
        return {
            "ok": True,
            "type": "sale",
            "message": f"✅ {qty} {prod['unit']} x {prod['name']} bika (₹{qty * prod['sp']:,.0f}). Stock update ho gaya."
        }

    # 2. Expense
    if nums:
        cat = next((k for k, ws in EXP_MAP.items() if any(w in t for w in ws)), "misc")
        amt = max(nums)
        db.execute("INSERT INTO expenses(date, category, amount, note) VALUES(?, ?, ?, ?)", (today, cat, amt, text))
        return {
            "ok": True,
            "type": "expense",
            "message": f"✅ ₹{amt:,.0f} kharcha ({cat.title()}) darj kar liya gaya."
        }

    return {
        "ok": False,
        "message": "Samajh nahi aaya. Example: '2 atta becha', 'bijli bill 1800 diya', '50 maggi aaya'."
    }
