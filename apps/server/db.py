# This file connects to the supabase db to access tables for analytics

import os
from contextlib import contextmanager

from dotenv import load_dotenv
from psycopg import Connection
from psycopg.rows import dict_row

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
        conn = Connection.connect(_get_database_url(), row_factory=dict_row)
        yield conn
    finally:
        if conn:
            conn.close()