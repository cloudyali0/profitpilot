import math
import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
from pydantic import BaseModel
from . import db, seed, engine, chat, quick_entry

router = APIRouter(tags=["Small Business Brain"])


class TextPayload(BaseModel):
    text: str


class ProductPayload(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    cp: Optional[float] = None
    sp: Optional[float] = None


def sanitize_floats(obj):
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_floats(v) for v in obj]
    return obj


@router.get("/overview")
def get_overview():
    """Returns store health score (0-100), 4 component breakdown, and 30-day KPIs."""
    return sanitize_floats(engine.overview())


@router.get("/recommendations")
def get_recommendations():
    """Returns ranked actionable recommendations with rupee impact."""
    return sanitize_floats(engine.recommendations())


@router.get("/inventory")
def get_inventory():
    """Returns stock intelligence: per-SKU days left, forecast, margin, and locked cash."""
    ins, _ = engine.stock_insights()
    records = ins.to_dict("records")
    return sanitize_floats(records)


@router.put("/inventory/{product_id}")
def update_inventory_product(product_id: int, body: ProductPayload):
    """Update product details or stock quantity in inventory."""
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [product_id]
        db.execute(f"UPDATE products SET {set_clause} WHERE id = ?", tuple(values))
    return {"status": "updated", "product_id": product_id}


@router.delete("/inventory/{product_id}")
def delete_inventory_product(product_id: int):
    """Delete a product from store inventory."""
    db.execute("DELETE FROM products WHERE id = ?", (product_id,))
    return {"status": "deleted", "product_id": product_id}


@router.post("/inventory")
def create_inventory_product(body: ProductPayload):
    """Add a new product to store inventory."""
    pid = db.execute(
        "INSERT INTO products (name, category, unit, cp, sp, stock) VALUES (?, ?, ?, ?, ?, ?)",
        (body.name or "New Product", body.category or "General", body.unit or "pcs", body.cp or 0.0, body.sp or 0.0, body.stock or 0)
    )
    return {"status": "created", "product_id": pid}


@router.get("/finance")
def get_finance():
    """Returns 8-week financial trends and 30-day category expense breakdown."""
    return sanitize_floats(engine.weekly_finance())


@router.get("/expenses")
def get_expenses():
    """Returns category-wise expense insights and anomaly alerts."""
    return sanitize_floats(engine.expense_insights())


@router.get("/forecast/backtest")
def get_backtest(days: int = 7):
    """Backtest 7-day demand forecast against actuals and return WAPE accuracy %."""
    return sanitize_floats(engine.backtest(days))


@router.get("/summary")
def get_summary():
    """Daily Hinglish morning brief for the store owner."""
    return {"text": engine.hinglish_summary()}


@router.post("/chat")
def ask_chat(body: TextPayload):
    """Ask Brain conversational assistant in Hinglish (Gemini AI + deterministic rules)."""
    return chat.ask(body.text)


@router.post("/quick-entry")
def run_quick_entry(body: TextPayload):
    """Hinglish natural language quick entry: sales, restocks, expenses."""
    return quick_entry.process(body.text)


@router.post("/seed/reset")
def reset_seed():
    """Reset database and seed 60 days of realistic kirana data with 4 strategic stories."""
    return seed.build()


@router.post("/seed/clear")
def clear_seed():
    """Wipe database clean for live judge demonstration."""
    return seed.clear()


@router.post("/upload/{kind}")
async def upload_csv(kind: str, file: UploadFile = File(...)):
    """Upload CSV data: 'products', 'sales', or 'expenses'."""
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        df.columns = [c.strip().lower() for c in df.columns]

        if kind == "products":
            need = {"name", "cp", "sp", "stock"}
            if not need <= set(df.columns):
                raise HTTPException(400, f"CSV must contain columns: {sorted(need)}")
            for c, v in (("category", "General"), ("unit", "pcs")):
                if c not in df:
                    df[c] = v
            db.insert_df("products", df[["name", "category", "unit", "cp", "sp", "stock"]])
            return {"status": "success", "inserted": len(df), "kind": kind}

        elif kind == "sales":
            if not {"date", "product", "qty"} <= set(df.columns):
                raise HTTPException(400, "CSV must contain columns: date, product, qty")
            p = db.read("select id,name from products")
            m = {n.lower(): i for i, n in zip(p["id"], p["name"])}

            def find_id(x):
                x = str(x).lower()
                return m.get(x) or next((i for n, i in m.items() if x in n), None)

            df["product_id"] = df["product"].map(find_id)
            unmatched = int(df["product_id"].isna().sum())
            df = df.dropna(subset=["product_id"])
            df["product_id"] = df["product_id"].astype(int)
            df["date"] = pd.to_datetime(df["date"]).dt.date.astype(str)
            db.insert_df("sales", df[["date", "product_id", "qty"]])
            return {"status": "success", "inserted": len(df), "unmatched_rows": unmatched, "kind": kind}

        elif kind == "expenses":
            if not {"date", "category", "amount"} <= set(df.columns):
                raise HTTPException(400, "CSV must contain columns: date, category, amount")
            if "note" not in df:
                df["note"] = ""
            df["date"] = pd.to_datetime(df["date"]).dt.date.astype(str)
            db.insert_df("expenses", df[["date", "category", "amount", "note"]])
            return {"status": "success", "inserted": len(df), "kind": kind}

        else:
            raise HTTPException(400, "Invalid kind. Must be 'products', 'sales', or 'expenses'")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"CSV parsing error: {str(e)}")
