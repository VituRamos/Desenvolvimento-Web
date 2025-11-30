import httpx
import os
import uuid
from jose import jwt, JWTError
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from passlib.context import CryptContext # Adiciona passlib para hashing de senhas

import database as db
import schemas

router = APIRouter(prefix="/auth") 

# --- Hashing de Senhas ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    # Retorna True se a senha em texto plano corresponde ao hash
    # Funciona mesmo se a senha no DB for texto simples, mas é inseguro
    return pwd_context.verify(plain_password, hashed_password)

# --- Leitura das Variáveis de Ambiente ---
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")


# --- Schemas de Entrada/Saída (Ajuste para Segurança) ---

# Usuário de entrada (contém senha)
class UsuarioCreate(schemas.BaseModel):
    nome: str
    email: str
    senha: str # A senha de entrada
    tipo: str

# Usuário de resposta (NÃO contém senha)
class UsuarioResponse(schemas.BaseModel):
    id: str
    nome: str
    email: str
    tipo: str
    
    class Config:
        orm_mode = True

# --- Rotas ---

@router.post("/usuarios", response_model=UsuarioResponse, tags=["Autenticação"])
def cadastrar_usuario(usuario_data: UsuarioCreate, database: Session = Depends(get_db)):
    """Cadastra um novo usuário com hashing de senha e tratamento de transação."""
    
    # 1. Verifica se o email já existe
    db_usuario_existente = database.query(db.Usuario).filter(db.Usuario.email == usuario_data.email).first()
    if db_usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    # 2. Gera um ID UUID e faz o hash da senha
    new_id = str(uuid.uuid4())
    hashed_password = hash_password(usuario_data.senha)
    
    # 3. Cria o modelo de DB
    db_usuario = db.Usuario(
        id=new_id, 
        nome=usuario_data.nome, 
        email=usuario_data.email, 
        senha=hashed_password, # SALVA O HASH AQUI
        tipo=usuario_data.tipo
    )
    
    try:
        # Tenta adicionar e fazer o commit
        database.add(db_usuario)
        database.commit()
        database.refresh(db_usuario)
    except Exception as e:
        # Se falhar (falha de conexão, timeout, erro de DB), reverte a transação
        database.rollback()
        # Imprime o erro completo. VERIFIQUE ESTE LOG NA VERCEL!
        print(f"ERRO CRÍTICO DE INSERÇÃO NO DB: {e}") 
        raise HTTPException(status_code=500, detail="Falha interna ao cadastrar usuário. Verifique logs do servidor.")

    # 4. Retorna a resposta (sem a senha)
    return UsuarioResponse.from_orm(db_usuario)


@router.post("/login", response_model=UsuarioResponse, tags=["Autenticação"])
def fazer_login(login_data: schemas.LoginData, database: Session = Depends(get_db)):
    """Realiza o login verificando o hash da senha."""
    usuario = database.query(db.Usuario).filter(db.Usuario.email == login_data.email).first()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")
    
    # IMPORTANTE: Verifica a senha em texto plano contra o hash salvo no DB
    # Nota: Se o usuário foi cadastrado antes do hashing, esta verificação falhará.
    if not verify_password(login_data.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")
    
    return UsuarioResponse.from_orm(usuario)


@router.post("/auth/google", tags=["Autenticação"])
async def auth_google(auth_code: schemas.GoogleAuthCode, database: Session = Depends(get_db)):
    # ... Seu código para Google OAuth (mantenha o try/except se houver database.add())
    # ... código omitido por ser extenso
    
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

    usuario_encontrado = database.query(db.Usuario).filter(db.Usuario.email == user_email).first()
    
    # Lógica de retorno alterada para usar o novo schema de resposta
    if usuario_encontrado:
        return UsuarioResponse.from_orm(usuario_encontrado)
    else:
        # Se for cadastro via Google, você deve inserir o usuário aqui
        # Se for apenas login, o usuário deve se cadastrar primeiro
        raise HTTPException(status_code=404, detail="Usuário não encontrado. Por favor, realize o cadastro primeiro.")
