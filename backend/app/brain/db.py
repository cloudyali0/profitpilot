import sqlite3
import os
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(__file__), "brain.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    unit TEXT,
    cp REAL,
    sp REAL,
    stock INTEGER
);
CREATE TABLE IF NOT EXISTS sales(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    product_id INTEGER,
    qty INTEGER
);
CREATE TABLE IF NOT EXISTS expenses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    category TEXT,
    amount REAL,
    note TEXT
);
"""


def conn():
    c = sqlite3.connect(DB_PATH, check_same_thread=False)
    c.executescript(SCHEMA)
    return c


def read(sql, params=()):
    with conn() as c:
        return pd.read_sql_query(sql, c, params=params)


def execute(sql, params=()):
    with conn() as c:
        cur = c.execute(sql, params)
        return cur.lastrowid


def insert_df(table, df):
    with conn() as c:
        df.to_sql(table, c, if_exists="append", index=False)


def wipe():
    with conn() as c:
        for t in ("products", "sales", "expenses"):
            c.execute(f"DELETE FROM {t}")
