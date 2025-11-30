# backend/routers/resultados.py
import uuid
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import database as db
import schemas

router = APIRouter()

from dependencies import get_db

@router.post("/simulados/{simulado_id}/resultados", response_model=schemas.Resultado, tags=["Resultados"])
def registrar_resultado(simulado_id: str, resultado: schemas.ResultadoCreate, database: Session = Depends(get_db)):
    resultado_existente = database.query(db.Resultado).filter(
        db.Resultado.usuario_id == resultado.usuario_id,
        db.Resultado.simulado_id == simulado_id
    ).first()

    if resultado_existente:
        if resultado.nota > resultado_existente.nota:
            resultado_existente.nota = resultado.nota
            resultado_existente.respostas = json.dumps(resultado.respostas)
            database.commit()
            database.refresh(resultado_existente)
        
        return schemas.Resultado(
            id=resultado_existente.id,
            usuario_id=resultado_existente.usuario_id,
            usuario_nome=resultado.usuario_nome,
            simulado_id=resultado_existente.simulado_id,
            nota=resultado_existente.nota,
            respostas=json.loads(resultado_existente.respostas)
        )
    else:
        novo_resultado = db.Resultado(
            id=str(uuid.uuid4()),
            usuario_id=resultado.usuario_id,
            simulado_id=simulado_id,
            nota=resultado.nota,
            respostas=json.dumps(resultado.respostas)
        )
        database.add(novo_resultado)
        database.commit()
        database.refresh(novo_resultado)
        
        return schemas.Resultado(
            id=novo_resultado.id,
            usuario_id=novo_resultado.usuario_id,
            usuario_nome=resultado.usuario_nome,
            simulado_id=novo_resultado.simulado_id,
            nota=novo_resultado.nota,
            respostas=resultado.respostas
        )

@router.get("/simulados/{simulado_id}/resultados", response_model=List[schemas.Resultado], tags=["Resultados"])
def listar_resultados(simulado_id: str, database: Session = Depends(get_db)):
    resultados = database.query(db.Resultado).filter(db.Resultado.simulado_id == simulado_id).all()
    # Usar um dicionário para mapear usuario_id para nome para evitar múltiplas queries para o mesmo usuário
    user_names = {u.id: u.nome for u in database.query(db.Usuario).filter(db.Usuario.id.in_([r.usuario_id for r in resultados])).all()}
    return [
        schemas.Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=user_names.get(r.usuario_id, "Nome não encontrado"),
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]

@router.get(`/resultados/{usuario_id}`, response_model=List[schemas.Resultado], tags=["Resultados"])
def get_resultados_usuario(usuario_id: str, database: Session = Depends(get_db)):
    usuario = database.query(db.Usuario).filter(db.Usuario.id == usuario_id).first()
    if not usuario:
        return [] # Ou lançar 404 se preferir
    
    resultados = database.query(db.Resultado).filter(db.Resultado.usuario_id == usuario_id).all()
    return [
        schemas.Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=usuario.nome,
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]

@router.get("/resultados", response_model=List[schemas.Resultado], tags=["Resultados"])
def get_todos_resultados(database: Session = Depends(get_db)):
    resultados = database.query(db.Resultado).all()
    # Otimização para evitar N+1 queries
    user_ids = {r.usuario_id for r in resultados}
    users = database.query(db.Usuario).filter(db.Usuario.id.in_(user_ids)).all()
    user_map = {user.id: user.nome for user in users}
    
    return [
        schemas.Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=user_map.get(r.usuario_id, "Desconhecido"),
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]
