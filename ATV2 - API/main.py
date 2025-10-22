# backend/main.py

import httpx
from jose import jwt, JWTError
from fastapi import FastAPI, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import List, Optional, Dict
import uuid
import json
import google.generativeai as genai
from pypdf import PdfReader
import io

GOOGLE_CLIENT_ID = ".apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = " "
GOOGLE_REDIRECT_URI = "http://localhost:5173"
GOOGLE_API_KEY = " "

# Configura a biblioteca do Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# --- 1. Instância da Aplicação ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Modelos de Dados (Pydantic) ---
class Usuario(BaseModel):
    id: Optional[str] = None
    nome: str
    email: str
    senha: Optional[str] = None
    tipo: str

class LoginData(BaseModel):
    email: str
    senha: str

class GoogleAuthCode(BaseModel):
    code: str

class OpcoesQuestao(BaseModel):
    a: str
    b: str
    c: str
    d: str
    e: str

class ExplicacoesQuestao(BaseModel):
    a: str
    b: str
    c: str
    d: str
    e: str

class Questao(BaseModel):
    id: int
    pergunta: str
    opcoes: OpcoesQuestao
    correta: str
    explicacoes: ExplicacoesQuestao

class SimuladoCompleto(BaseModel):
    id: str
    titulo: str
    questoes: List[Questao]

class SimuladoInfo(BaseModel):
    id: str
    nome: str

class Materia(BaseModel):
    id: str
    nome: str
    simulados: List[SimuladoInfo] = []

class MateriaCreate(BaseModel):
    nome: str

# --- 3. "Banco de Dados" Falso ---
db_usuarios: List[Usuario] = []
db_materias: List[Materia] = []
db_simulados: Dict[str, SimuladoCompleto] = {} # Dicionário ID -> Simulado

# --- 4. Endpoints de Autenticação ---
@app.get("/")
def read_root():
    return {"message": "API do SimulAI está no ar!"}

@app.post("/usuarios", response_model=Usuario)
def cadastrar_usuario(usuario: Usuario):
    usuario.id = str(uuid.uuid4())
    db_usuarios.append(usuario)
    return usuario

@app.post("/login")
def fazer_login(login_data: LoginData):
    for usuario in db_usuarios:
        if usuario.email == login_data.email and usuario.senha == login_data.senha:
            return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email, "tipo": usuario.tipo}
    raise HTTPException(status_code=401, detail="Email ou senha inválidos")

@app.post("/auth/google")
async def auth_google(auth_code: GoogleAuthCode):
    token_url = "https://oauth2.googleapis.com/token"
    token_data = { "code": auth_code.code, "client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET, "redirect_uri": GOOGLE_REDIRECT_URI, "grant_type": "authorization_code", }
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao trocar código do Google")
    token_json = token_response.json()
    id_token = token_json.get("id_token")
    try:
        payload = jwt.decode(id_token, key="", options={"verify_signature": False, "verify_aud": False})
        user_email = payload.get("email")
        user_name = payload.get("name")
        if not user_email:
            raise HTTPException(status_code=400, detail="Email não encontrado no token do Google")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token do Google inválido")
    usuario_encontrado = next((u for u in db_usuarios if u.email == user_email), None)
    if usuario_encontrado:
        return {"id": usuario_encontrado.id, "nome": usuario_encontrado.nome, "email": usuario_encontrado.email, "tipo": usuario_encontrado.tipo}
    else:
        novo_usuario = Usuario( id=str(uuid.uuid4()), nome=user_name, email=user_email, tipo="aluno" )
        db_usuarios.append(novo_usuario)
        return {"id": novo_usuario.id, "nome": novo_usuario.nome, "email": novo_usuario.email, "tipo": novo_usuario.tipo}

# --- 5. Endpoints de Matérias e Simulados ---
@app.get("/materias", response_model=List[Materia])
def get_materias():
    return db_materias

@app.post("/materias", response_model=Materia)
def create_materia(materia_data: MateriaCreate):
    nova_materia = Materia( id=str(uuid.uuid4()), nome=materia_data.nome, simulados=[] )
    db_materias.append(nova_materia)
    return nova_materia

# --- Endpoint GET Simulado ---
@app.get("/simulados/{id_simulado}", response_model=SimuladoCompleto)
def get_simulado(id_simulado: str):
    """
    Busca um simulado completo pelo ID. Usado pelo Simulado.jsx.
    """
    ### DEBUG ###
    print(f"\n--- REQUISIÇÃO GET /simulados/{id_simulado} ---")
    print(f"ID Solicitado: {id_simulado}")
    print(f"Conteúdo ATUAL de db_simulados: {list(db_simulados.keys())}") # Mostra as chaves (IDs) que existem
    ### FIM DEBUG ###

    simulado = db_simulados.get(id_simulado)
    if not simulado:
        print(f"!!! ERRO: ID '{id_simulado}' NÃO ENCONTRADO em db_simulados. !!!") ### DEBUG ###
        raise HTTPException(status_code=404, detail="Simulado não encontrado")

    print(f"Simulado '{simulado.titulo}' encontrado e retornado.") ### DEBUG ###
    return simulado

# --- Endpoint POST Simulado ---
@app.post("/materias/{id_materia}/simulados", response_model=SimuladoCompleto)
async def create_simulado_from_gemini(
    id_materia: str,
    nome_simulado: str = Form(...),
    arquivo: UploadFile = Form(...)
):
    """
    Cria um novo simulado usando a API do Gemini, agora com suporte a PDF.
    """
    materia = next((m for m in db_materias if m.id == id_materia), None)
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")

    texto_base = ""
    try:
        conteudo_bytes = await arquivo.read()
        if arquivo.content_type == 'application/pdf' or arquivo.filename.lower().endswith('.pdf'):
            print(f">>> Processando arquivo PDF: {arquivo.filename} <<<")
            pdf_file = io.BytesIO(conteudo_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                texto_base += page.extract_text() + "\n"
            if not texto_base:
                 raise HTTPException(status_code=400, detail="Não foi possível extrair texto do PDF. O PDF pode conter apenas imagens.")
        else:
            print(f">>> Processando arquivo de texto: {arquivo.filename} <<<")
            texto_base = conteudo_bytes.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Não foi possível ler ou processar o arquivo: {e}")

    prompt = f"""
    Baseado no seguinte texto, gere um simulado de 5 questões de múltipla escolha (a, b, c, d, e).
    Para CADA questão, forneça a pergunta, as 5 opções, a letra da opção correta, e uma breve explicação para cada uma das 5 opções.

    RETORNE A RESPOSTA ESTRITAMENTE NO SEGUINTE FORMATO JSON (NÃO inclua markdown '```json' ou qualquer outro texto fora do JSON):
    {{
      "questoes": [
        {{
          "id": 1,
          "pergunta": "...",
          "opcoes": {{ "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." }},
          "correta": "a",
          "explicacoes": {{ "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." }}
        }},
        {{
          "id": 2,
          "pergunta": "...",
          ... (e assim por diante até 5)
        }}
      ]
    }}

    TEXTO BASE:
    ---
    {texto_base}
    ---
    """

    try:
        print(">>> CHAMANDO API DO GEMINI (AGUARDE...) <<<")
        model = genai.GenerativeModel('gemini-2.5-flash') # Usando o modelo estável
        response = await model.generate_content_async(prompt)

        texto_resposta = response.text.strip()
        if texto_resposta.startswith("```json"):
            texto_resposta = texto_resposta[7:]
        if texto_resposta.endswith("```"):
            texto_resposta = texto_resposta[:-3]

        resposta_json = json.loads(texto_resposta)

        novo_simulado_id = str(uuid.uuid4())
        novo_simulado_completo = SimuladoCompleto(
            id=novo_simulado_id,
            titulo=nome_simulado,
            questoes=resposta_json['questoes']
        )
        print(">>> RESPOSTA DO GEMINI RECEBIDA E VALIDADA! <<<")

    except ValidationError as e:
        print("ERRO DE VALIDAÇÃO DO PYDANTIC:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao validar dados do Gemini: {e}")
    except json.JSONDecodeError:
        print("ERRO: Resposta do Gemini não é um JSON válido.")
        print("RESPOSTA RECEBIDA:", response.text)
        raise HTTPException(status_code=500, detail="Resposta do Gemini não está em formato JSON.")
    except Exception as e:
        print(f"ERRO AO CHAMAR GEMINI: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na API do Gemini: {e}")

    db_simulados[novo_simulado_id] = novo_simulado_completo
    info_simulado = SimuladoInfo(id=novo_simulado_id, nome=nome_simulado)
    materia.simulados.append(info_simulado)

    ### DEBUG ###
    print(f"\n--- SIMULADO CRIADO (POST /materias/.../simulados) ---")
    print(f"Novo ID Gerado: {novo_simulado_id}")
    print(f"Simulado '{nome_simulado}' adicionado ao db_simulados.")
    print(f"Conteúdo de db_simulados APÓS adicionar: {list(db_simulados.keys())}")
    ### FIM DEBUG ###

    return novo_simulado_completo