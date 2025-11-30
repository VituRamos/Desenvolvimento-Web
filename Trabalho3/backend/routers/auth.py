# backend/routers/auth.py
import os
import httpx
from datetime import timedelta, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import database as db
import schemas
from dependencies import get_db, oauth2_scheme

# --- Configuração de Autenticação ---
SECRET_KEY = os.environ.get("SECRET_KEY", "your_default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto para hashing de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# --- Funções Utilitárias de Autenticação ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Dependência para Obter Usuário Atual ---
async def get_current_user(token: str = Depends(oauth2_scheme), database: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = database.query(db.Usuario).filter(db.Usuario.email == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: schemas.Usuario = Depends(get_current_user)):
    # Futuramente, pode-se adicionar uma verificação se o usuário está ativo
    return current_user

# --- Endpoints de Autenticação ---
@router.post("/usuarios", response_model=schemas.Usuario, tags=["Autenticação"])
def cadastrar_usuario(usuario: schemas.Usuario, database: Session = Depends(get_db)):
    db_usuario_existente_email = database.query(db.Usuario).filter(db.Usuario.email == usuario.email).first()
    if db_usuario_existente_email:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    hashed_password = get_password_hash(usuario.senha) if usuario.senha else None
    
    db_usuario = db.Usuario(id=usuario.id, nome=usuario.nome, email=usuario.email, senha=hashed_password, tipo=usuario.tipo)
    database.add(db_usuario)
    database.commit()
    database.refresh(db_usuario)
    
    return schemas.Usuario(id=db_usuario.id, nome=db_usuario.nome, email=db_usuario.email, tipo=db_usuario.tipo)

@router.post("/login", response_model=schemas.Token, tags=["Autenticação"])
async def fazer_login(form_data: OAuth2PasswordRequestForm = Depends(), database: Session = Depends(get_db)):
    usuario = database.query(db.Usuario).filter(db.Usuario.email == form_data.username).first()
    if not usuario or not verify_password(form_data.password, usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- Google Auth com JWT ---
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")

@router.post("/auth/google", response_model=schemas.Token, tags=["Autenticação"])
async def auth_google(auth_code: schemas.GoogleAuthCode, database: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET or not GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Credenciais do Google não configuradas no servidor.")

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": auth_code.code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
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

    usuario = database.query(db.Usuario).filter(db.Usuario.email == user_email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado. Por favor, realize o cadastro primeiro.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
