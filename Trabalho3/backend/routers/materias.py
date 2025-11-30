# backend/routers/materias.py
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_db
from routers.auth import get_current_active_user # Importa a dependência

import database as db
import schemas

router = APIRouter()

@router.get("/materias", response_model=List[schemas.Materia], tags=["Matérias"])
def get_materias(database: Session = Depends(get_db), current_user: schemas.Usuario = Depends(get_current_active_user)):
    # Se o usuário for um professor, retorna apenas as matérias dele
    if current_user.tipo == 'professor':
        materias_db = database.query(db.Materia).filter(db.Materia.professor_id == current_user.id).all()
    # Se for aluno (ou outro tipo), retorna todas as matérias
    else:
        materias_db = database.query(db.Materia).all()
        
    materias_pydantic = []
    for materia_db in materias_db:
        simulados_info = [schemas.SimuladoInfo(id=s.id, nome=s.titulo) for s in materia_db.simulados]
        materias_pydantic.append(schemas.Materia(id=materia_db.id, nome=materia_db.nome, simulados=simulados_info))
    return materias_pydantic

@router.post("/materias", response_model=schemas.Materia, tags=["Matérias"])
def create_materia(materia_data: schemas.MateriaCreate, database: Session = Depends(get_db), current_user: schemas.Usuario = Depends(get_current_active_user)):
    # Apenas professores podem criar matérias
    if current_user.tipo != 'professor':
        raise HTTPException(status_code=403, detail="Apenas professores podem criar matérias.")

    nova_materia = db.Materia(
        id=str(uuid.uuid4()), 
        nome=materia_data.nome,
        professor_id=current_user.id  # Associa a matéria ao professor logado
    )
    database.add(nova_materia)
    database.commit()
    database.refresh(nova_materia)

    # Retorna o objeto completo, incluindo a lista de simulados vazia
    return schemas.Materia(
        id=nova_materia.id,
        nome=nova_materia.nome,
        simulados=[]
    )
