# backend/dependencies.py
import database as db

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()
