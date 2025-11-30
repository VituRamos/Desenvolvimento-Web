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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://simulai-frontend.vercel.app"], # Permite acesso do seu front-end React.
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.).
    allow_headers=["*"], # Permite todos os cabeçalhos.
)

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"message": "API do SimulAI está no ar!"}

# Inclui os routers
app.include_router(auth.router)
app.include_router(materias.router)
app.include_router(simulados.router)
app.include_router(resultados.router)
