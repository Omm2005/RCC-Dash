# This file connects to the supabase db to access tables for analytics

import os
from contextlib import contextmanager

from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import connection as Connection
from psycopg2.extras import RealDictCursor

load_dotenv()

def _get_env_value(*keys: str) -> str | None:
    for key in keys:
        value = os.getenv(key)
        if value:
            return value
    return None

def _get_connection_kwargs() -> dict:
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return {"dsn": db_url}

    env_values = {
        "user": _get_env_value("DB_USER", "user"),
        "password": _get_env_value("DB_PASSWORD", "password"),
        "host": _get_env_value("DB_HOST", "host"),
        "port": _get_env_value("DB_PORT", "port"),
        "dbname": _get_env_value("DB_NAME", "dbname"),
    }

    missing = [key for key, value in env_values.items() if not value]
    if missing:
        missing_list = ", ".join(missing)
        raise RuntimeError(
            f"Missing DB connection settings: {missing_list}. "
            "Set DATABASE_URL or the individual variables."
        )

    return env_values

# The context manager yields a database connection and ensures it is closed after use
@contextmanager
def get_conn() -> Connection:
    conn = None
    try:
        conn = psycopg2.connect(
            cursor_factory=RealDictCursor,
            **_get_connection_kwargs(),
        )
        yield conn
    finally:
        if conn is not None:
            conn.close()
