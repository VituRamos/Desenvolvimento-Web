# backend/routers/auth.py

import httpx
from jose import jwt, JWTError
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
import os # <--- NOVO: Importa o módulo OS para variáveis de ambiente

import database as db
import schemas
# REMOVER: import config # <--- REMOVIDO para eliminar o erro

router = APIRouter()

# --- Leitura das Variáveis de Ambiente ---
# Elas DEVEM ser configuradas no painel da Vercel
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")


@router.post("/usuarios", response_model=schemas.Usuario, tags=["Autenticação"])
def cadastrar_usuario(usuario: schemas.Usuario, database: Session = Depends(get_db)):
    db_usuario_existente = database.query(db.Usuario).filter(db.Usuario.id == usuario.id).first()
    if db_usuario_existente:
        raise HTTPException(status_code=400, detail="ID já cadastrado.")

    db_usuario = db.Usuario(id=usuario.id, nome=usuario.nome, email=usuario.email, senha=usuario.senha, tipo=usuario.tipo)
    database.add(db_usuario)
    database.commit()
    database.refresh(db_usuario)
    return schemas.Usuario(id=db_usuario.id, nome=db_usuario.nome, email=db_usuario.email, tipo=db_usuario.tipo)

@router.post("/login", tags=["Autenticação"])
def fazer_login(login_data: schemas.LoginData, database: Session = Depends(get_db)):
    usuario = database.query(db.Usuario).filter(db.Usuario.email == login_data.email).first()
    if not usuario or usuario.senha != login_data.senha:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email, "tipo": usuario.tipo}

@router.post("/auth/google", tags=["Autenticação"])
async def auth_google(auth_code: schemas.GoogleAuthCode, database: Session = Depends(get_db)):
    # Verifica se as credenciais do Google foram carregadas
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET or not GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Credenciais do Google não configuradas no servidor.")

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": auth_code.code,
        "client_id": GOOGLE_CLIENT_ID, # <--- Corrigido para a variável de ambiente
        "client_secret": GOOGLE_CLIENT_SECRET, # <--- Corrigido para a variável de ambiente
        "redirect_uri": GOOGLE_REDIRECT_URI, # <--- Corrigido para a variável de ambiente
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
    
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao trocar código do Google")

    id_token = token_response.json().get("id_token")
    try:
        payload = jwt.decode(id_token, key="", options={"verify_signature": False, "verify_aud": False})
        user_email = payload.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="Email não encontrado no token do Google")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token do Google inválido")

    usuario_encontrado = database.query(db.Usuario).filter(db.Usuario.email == user_email).first()
    if usuario_encontrado:
        return {"id": usuario_encontrado.id, "nome": usuario_encontrado.nome, "email": usuario_encontrado.email, "tipo": usuario_encontrado.tipo}
    else:
        raise HTTPException(status_code=404, detail="Usuário não encontrado. Por favor, realize o cadastro primeiro.")
