# backend/dependencies.py
from fastapi.security import OAuth2PasswordBearer
import database as db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()
