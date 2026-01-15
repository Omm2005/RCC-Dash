import os
from contextlib import contextmanager

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def _get_database_url() -> str:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set")
    return db_url

@contextmanager
def get_conn():
    conn = None
    try:
        conn = psycopg2.connect(
            _get_database_url(),
            cursor_factory=RealDictCursor
        )
        yield conn
    finally:
        if conn:
            conn.close()