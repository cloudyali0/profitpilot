"""Small Business Brain - FastAPI Application Entry Point"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import create_tables, get_db_session
from .database.seed import seed_database
from .api.agent import router as agent_router
from .api.products import router as products_router
from .api.orders import router as orders_router
from .api.customers import router as customers_router
from .api.dashboard import router as dashboard_router
from .api.delivery import router as delivery_router
from .brain import brain_router, db as brain_db, seed as brain_seed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ProfitPilot",
    description="Intelligent Decision Engine & Retail Analytics for Kirana and Small Businesses",
    version="1.0.0",
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Small Business Brain router directly under /api
app.include_router(brain_router, prefix="/api")

# Also include operational/order-taking routers for backward compatibility
app.include_router(agent_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(customers_router)
app.include_router(dashboard_router)
app.include_router(delivery_router)


@app.on_event("startup")
def startup():
    """Initialize database and seed data on startup."""
    logger.info("Starting Small Business Brain...")
    create_tables()
    with get_db_session() as db:
        seed_database(db)

    # Auto-seed Brain SQLite database if empty
    try:
        check = brain_db.read("SELECT count(*) as c FROM products")
        if check.empty or check["c"][0] == 0:
            logger.info("Seeding Small Business Brain 60-day kirana dataset...")
            brain_seed.build()
            logger.info("Small Business Brain database seeded successfully.")
    except Exception as e:
        logger.warning(f"Error checking brain database: {e}. Seeding fresh...")
        brain_seed.build()

    logger.info(f"ProfitPilot ready. AI Provider: {settings.ai_provider}")


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "platform": "ProfitPilot",
        "store": settings.store_name,
        "ai_provider": settings.ai_provider,
        "version": "1.0.0",
    }
