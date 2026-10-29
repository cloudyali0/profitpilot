"""60-day realistic kirana data. Four planted stories:
1) Atta / Chai / Butter running out fast (reorder)
2) Corn Flakes / Honey / Chyawanprash 45+ days without sale (dead stock)
3) Sugar high volume on ~2% margin (margin leak)
4) Last 7 days wastage spike (expense anomaly)
"""
import numpy as np
import pandas as pd
from datetime import date, timedelta
from . import db

# name, category, unit, cp, sp, base_daily, stock
PRODUCTS = [
    ("Aashirvaad Atta 5kg", "Staples", "pack", 218, 245, 9, 18),
    ("Fortune Soya Oil 1L", "Staples", "pouch", 128, 140, 6, 60),
    ("Tata Salt 1kg", "Staples", "pack", 24, 28, 8, 50),
    ("Sugar 1kg", "Staples", "kg", 43, 44, 10, 40),
    ("Toor Dal 1kg", "Staples", "kg", 138, 155, 6, 45),
    ("Basmati Rice 1kg", "Staples", "kg", 98, 112, 5, 40),
    ("Tata Tea Gold 250g", "Beverages", "pack", 128, 145, 5, 15),
    ("Maggi 70g", "Snacks", "pack", 12.5, 14, 25, 120),
    ("Kurkure 40g", "Snacks", "pack", 17, 20, 10, 60),
    ("Haldiram Bhujia 200g", "Snacks", "pack", 48, 60, 4, 30),
    ("Bisleri 1L", "Beverages", "bottle", 15, 20, 15, 90),
    ("Coca-Cola 600ml", "Beverages", "bottle", 32, 40, 8, 48),
    ("Amul Butter 100g", "Dairy", "pack", 55, 60, 5, 12),
    ("Surf Excel 1kg", "Household", "pack", 118, 130, 3, 25),
    ("Vim Bar", "Household", "pcs", 8, 10, 10, 80),
    ("Lux Soap", "Personal Care", "pcs", 28, 33, 6, 40),
    ("Colgate 100g", "Personal Care", "pack", 52, 60, 4, 30),
    ("Kellogg's Corn Flakes 475g", "Breakfast", "pack", 160, 185, 1.2, 14),
    ("Patanjali Honey 500g", "Breakfast", "bottle", 175, 210, 0.8, 9),
    ("Dabur Chyawanprash 1kg", "Health", "jar", 330, 390, 0.6, 6),
]

DEAD = {"Kellogg's Corn Flakes 475g", "Patanjali Honey 500g", "Dabur Chyawanprash 1kg"}
WD = [0.9, 0.9, 0.95, 1.0, 1.1, 1.35, 1.3]  # Mon..Sun


def build(days=60):
    rng = np.random.default_rng(42)
    db.wipe()
    prod = pd.DataFrame([(n, c, u, cp, sp, st) for n, c, u, cp, sp, _, st in PRODUCTS],
                        columns=["name", "category", "unit", "cp", "sp", "stock"])
    db.insert_df("products", prod)
    ids = db.read("select id,name from products").set_index("name")["id"].to_dict()

    end = date.today() - timedelta(days=1)
    rows = []
    for i in range(days):
        d = end - timedelta(days=days - 1 - i)
        age = (end - d).days  # 0 = yesterday
        for n, _, _, _, _, base, _ in PRODUCTS:
            if n in DEAD and age < 45:
                continue
            lam = base * WD[d.weekday()]
            if n == "Aashirvaad Atta 5kg" and age < 10:
                lam *= 1.4  # demand surging
            q = int(rng.poisson(lam))
            if q:
                rows.append((d.isoformat(), ids[n], q))
    db.insert_df("sales", pd.DataFrame(rows, columns=["date", "product_id", "qty"]))

    exp = []
    for i in range(days):
        d = end - timedelta(days=days - 1 - i)
        age = (end - d).days
        if d.day == 1:
            exp.append((d.isoformat(), "rent", 8000, "Store Rent"))
        if d.day == 1:
            exp.append((d.isoformat(), "salary", 9000, "Staff Salary"))
        if d.day == 5:
            exp.append((d.isoformat(), "electricity", 2200, "Electricity Bill"))
        if d.weekday() in (1, 4):
            exp.append((d.isoformat(), "transport", int(rng.integers(300, 450)), "Logistics / Freight"))
        if rng.random() < 0.25:
            exp.append((d.isoformat(), "wastage", int(rng.integers(40, 120)), "Spoilage / Damaged items"))
        if age < 7 and rng.random() < 0.8:
            exp.append((d.isoformat(), "wastage", int(rng.integers(250, 450)), "Dairy & Bread spoilage"))
        if rng.random() < 0.3:
            exp.append((d.isoformat(), "misc", int(rng.integers(50, 150)), "Miscellaneous store expense"))
    db.insert_df("expenses", pd.DataFrame(exp, columns=["date", "category", "amount", "note"]))
    return {"products": len(prod), "sales_rows": len(rows), "expense_rows": len(exp)}
