from fastapi import APIRouter, HTTPException
from app.db import get_conn
from app.services.retention import build_retention_payload
from app.services.overview import build_overview_payload

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/retention")
def retention():
    try:
        with get_conn() as conn:
            return build_retention_payload(conn)
    except Exception as e:

        return {"detail": str(e)}  # TEMP: guaranteed JSON output

@router.get("/overview") 
def overview():
    try:
        with get_conn() as conn:
            return build_overview_payload(conn)
    except Exception as e:
        return {"detail": str(e)}
