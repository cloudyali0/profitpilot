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


SYNONYMS = {
    "atta": ["atta", "aata", "gehu", "wheat", "flour", "aashirvaad"],
    "oil": ["oil", "tel", "tail", "soya", "fortune"],
    "salt": ["salt", "namak", "tata"],
    "sugar": ["sugar", "cheeni", "chini", "shakkar"],
    "dal": ["dal", "daal", "toor"],
    "rice": ["rice", "chawal", "basmati"],
    "tea": ["tea", "chai", "chaipatti"],
    "maggi": ["maggi", "noodles"],
    "butter": ["butter", "makkhan", "amul"],
    "soap": ["soap", "sabun", "lux"],
    "paste": ["colgate", "paste", "toothpaste", "dant"],
    "surf": ["surf", "detergent", "powder", "excel"],
    "bar": ["vim", "bartan", "bar"],
    "water": ["bisleri", "pani", "water"],
    "coke": ["coca", "coke", "colddrink", "thanda", "pepsi"],
    "honey": ["honey", "shehad", "patanjali"],
    "kurkure": ["kurkure", "namkeen", "chips"],
    "bhujia": ["bhujia", "sev", "haldiram"],
    "chyawanprash": ["chyawanprash", "dabur"],
    "flakes": ["corn", "kellogg", "flakes"]
}


def _expand_tokens(tokens):
    expanded = set(tokens)
    for syn_key, words in SYNONYMS.items():
        if any(w in tokens for w in words):
            expanded.add(syn_key)
            expanded.update(words)
    return expanded


def _match_product(text):
    p = db.read("select * from products")
    if len(p) == 0:
        return None
    raw_toks = set(re.findall(r"[a-z0-9']+", text.lower()))
    toks = _expand_tokens(raw_toks)
    best, score = None, 0
    for _, r in p.iterrows():
        p_name = r["name"].lower()
        nt = _expand_tokens(set(re.findall(r"[a-z0-9']+", p_name)))
        sc = len(toks & nt)
        # Substring bonus
        for t in raw_toks:
            if len(t) >= 3 and t in p_name:
                sc += 2
        if sc > score:
            best, score = r, sc
    return best if score > 0 else None


def process(text):
    t = text.lower()
    nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", t)]
    today = date.today().isoformat()

    has_restock = any(w in t for w in RESTOCK)
    has_sale = any(w in t for w in SALE)

    # 1. Product Restock or Sale
    prod = _match_product(t)
    if prod is not None and (has_restock or has_sale or nums):
        qty = int(nums[0]) if nums else 1
        pid = int(prod["id"])

        if has_restock:
            db.execute("UPDATE products SET stock = stock + ? WHERE id = ?", (qty, pid))
            return {
                "ok": True,
                "type": "restock",
                "message": f"✅ {prod['name']} me {qty} {prod['unit']} stock add hua! (Naya stock: {int(prod['stock']) + qty})"
            }

        # Sale (either explicit 'becha' or implied by product + quantity)
        curr_stock = int(prod["stock"])
        new_stock = max(curr_stock - qty, 0)
        db.execute("INSERT INTO sales(date, product_id, qty) VALUES(?, ?, ?)", (today, pid, qty))
        db.execute("UPDATE products SET stock = ? WHERE id = ?", (new_stock, pid))
        return {
            "ok": True,
            "type": "sale",
            "message": f"✅ {qty} {prod['unit']} x {prod['name']} bika (₹{qty * prod['sp']:,.0f}). Stock update ho gaya (Stock bacha: {new_stock})."
        }

    # 2. Expense (with numbers and category match, or explicit expense word)
    has_expense = any(w in t for w in ("kharcha", "expense", "bill", "diya", "paid", "bhada", "kiraya", "salary", "bijli", "wastage"))
    if nums and (has_expense or any(any(w in t for w in ws) for ws in EXP_MAP.values())):
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
        "message": "Samajh nahi aaya. Example: '2 atta becha', 'bijli bill 1800 diya', '50 maggi aaya', 'auto 200'."
    }
