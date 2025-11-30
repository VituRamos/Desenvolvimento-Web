# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

#import config
import database as db
from routers import auth, materias, simulados, resultados
import os

# Configura a API do Google Gemini com a chave fornecida no arquivo config.py.
#genai.configure(api_key=config.GOOGLE_API_KEY)
api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- Instância da Aplicação FastAPI ---
app = FastAPI()

@app.on_event("startup")
def startup_event():
    db.create_db_and_tables()

# --- INICIO DA CONFIGURAÇÃO DO CORS ---
origins = [
    "http://localhost:5173",  # Vite local
    "http://localhost:3000",  # Caso use outra porta local
    "https://simulai-frontend.vercel.app", # <--- SUA URL DE PRODUÇÃO
    # ATENÇÃO: NÃO coloque barra "/" no final da URL acima!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todos os headers (Authorization, etc.)
)
# --- FIM DA CONFIGURAÇÃO DO CORS ---

# Suas rotas vêm DEPOIS daqui
#@app.post("/usuarios")
#def criar_usuario(dados: dict):
#    return {"msg": "Criado"}

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"message": "API do SimulAI está no ar!"}

# Inclui os routers
app.include_router(auth.router)
app.include_router(materias.router)
app.include_router(simulados.router)
app.include_router(resultados.router)
