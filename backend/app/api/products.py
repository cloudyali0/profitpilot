"""ProfitPilot AI - Products API Routes"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Product
from ..schemas import ProductOut, ProductBrief
from ..tools.product_tools import search_products as search_fn, check_low_stock

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all products, optionally filtered by category or search."""
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category == category)

    if search:
        results = search_fn(db, search, limit=20)
        product_ids = [r["product"].id for r in results]
        return db.query(Product).filter(Product.id.in_(product_ids)).all()

    return query.order_by(Product.category, Product.name).all()


@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    """List all product categories."""
    rows = (
        db.query(Product.category)
        .filter(Product.is_active == True)
        .distinct()
        .order_by(Product.category)
        .all()
    )
    return [r[0] for r in rows]


@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    """Get all products at or below their low-stock threshold."""
    return check_low_stock(db)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}")
def update_product(product_id: int, updates: dict, db: Session = Depends(get_db)):
    """Update product details or stock quantity."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in updates.items():
        if hasattr(product, k) and v is not None:
            setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return {"status": "updated", "product_id": product.id}


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete or deactivate a product from store."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"status": "deleted", "product_id": product_id}


@router.post("")
def create_product(data: dict, db: Session = Depends(get_db)):
    """Create a new product in store inventory."""
    p = Product(
        name=data.get("name", "New Product"),
        category=data.get("category", "General"),
        brand=data.get("brand", ""),
        unit=data.get("unit", "pcs"),
        price=float(data.get("price") or data.get("sp") or 0.0),
        cost_price=float(data.get("cost_price") or data.get("cp") or 0.0),
        stock=int(data.get("stock", 0)),
        low_stock_threshold=int(data.get("low_stock_threshold", 10)),
        description=data.get("description", ""),
        is_active=True,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"status": "created", "product_id": p.id}
