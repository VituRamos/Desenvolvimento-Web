# backend/routers/materias.py
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_db

import database as db
import schemas

router = APIRouter()

@router.get("/materias", response_model=List[schemas.Materia], tags=["Matérias"])
def get_materias(database: Session = Depends(get_db)):
    materias_db = database.query(db.Materia).all()
    materias_pydantic = []
    for materia_db in materias_db:
        simulados_info = [schemas.SimuladoInfo(id=s.id, nome=s.titulo) for s in materia_db.simulados]
        materias_pydantic.append(schemas.Materia(id=materia_db.id, nome=materia_db.nome, simulados=simulados_info))
    return materias_pydantic

@router.post("/materias", response_model=schemas.Materia, tags=["Matérias"])
def create_materia(materia_data: schemas.MateriaCreate, database: Session = Depends(get_db)):
    nova_materia = db.Materia(id=str(uuid.uuid4()), nome=materia_data.nome)
    database.add(nova_materia)
    database.commit()
    database.refresh(nova_materia)
    return nova_materia
