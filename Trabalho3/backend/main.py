# backend/main.py

# --- Inicialização ---
# Importa as bibliotecas necessárias para o funcionamento da API.
import httpx
from jose import jwt, JWTError
from fastapi import FastAPI, HTTPException, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import List, Optional, Dict
import uuid
import json
import google.generativeai as genai
from pypdf import PdfReader
import io
import config # Importa o arquivo de configuração com as chaves de API.
from sqlalchemy.orm import Session
import database as db

# Configura a API do Google Gemini com a chave fornecida no arquivo config.py.
genai.configure(api_key=config.GOOGLE_API_KEY)

# --- Instância da Aplicação FastAPI ---
# Cria a aplicação FastAPI e configura o CORS para permitir requisições do front-end.
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Permite acesso do seu front-end React.
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.).
    allow_headers=["*"], # Permite todos os cabeçalhos.
)

# --- Modelos de Dados (Pydantic) ---
# Define a estrutura (schema) dos dados que a API irá receber e enviar.
# Isso garante validação e consistência dos dados.
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

class Resultado(BaseModel):
    id: str
    usuario_id: str
    usuario_nome: str
    simulado_id: str
    nota: float
    respostas: Dict[str, str]

class ResultadoCreate(BaseModel):
    usuario_id: str
    usuario_nome: str
    nota: float
    respostas: Dict[str, str]

# --- Dependency ---
def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

@app.on_event("startup")
def startup_event():
    db.create_db_and_tables()

# --- Endpoints de Autenticação ---
# Contém as rotas (endpoints) para cadastro, login e autenticação com Google.

@app.get("/")
def read_root():
    """Endpoint inicial para verificar se a API está no ar."""
    return {"message": "API do SimulAI está no ar!"}

@app.post("/usuarios", response_model=Usuario)
def cadastrar_usuario(usuario: Usuario, database: Session = Depends(get_db)):
    """Cria um novo usuário no banco de dados."""
    db_usuario = db.Usuario(id=str(uuid.uuid4()), nome=usuario.nome, email=usuario.email, senha=usuario.senha, tipo=usuario.tipo)
    database.add(db_usuario)
    database.commit()
    database.refresh(db_usuario)
    return db_usuario

@app.post("/login")
def fazer_login(login_data: LoginData, database: Session = Depends(get_db)):
    """Autentica um usuário com email e senha."""
    usuario = database.query(db.Usuario).filter(db.Usuario.email == login_data.email).first()
    if not usuario or usuario.senha != login_data.senha:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email, "tipo": usuario.tipo}

@app.post("/auth/google")
async def auth_google(auth_code: GoogleAuthCode, database: Session = Depends(get_db)):
    """Autentica um usuário via Google, trocando o código de autorização por um token."""
    token_url = "https://oauth2.googleapis.com/token"
    token_data = { "code": auth_code.code, "client_id": config.GOOGLE_CLIENT_ID, "client_secret": config.GOOGLE_CLIENT_SECRET, "redirect_uri": config.GOOGLE_REDIRECT_URI, "grant_type": "authorization_code", }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
    
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao trocar código do Google")

    id_token = token_response.json().get("id_token")
    try:
        payload = jwt.decode(id_token, key="", options={"verify_signature": False, "verify_aud": False})
        user_email = payload.get("email")
        user_name = payload.get("name")
        if not user_email:
            raise HTTPException(status_code=400, detail="Email não encontrado no token do Google")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token do Google inválido")

    usuario_encontrado = database.query(db.Usuario).filter(db.Usuario.email == user_email).first()
    if usuario_encontrado:
        return {"id": usuario_encontrado.id, "nome": usuario_encontrado.nome, "email": usuario_encontrado.email, "tipo": usuario_encontrado.tipo}
    else:
        novo_usuario = db.Usuario(id=str(uuid.uuid4()), nome=user_name, email=user_email, tipo="aluno")
        database.add(novo_usuario)
        database.commit()
        database.refresh(novo_usuario)
        return {"id": novo_usuario.id, "nome": novo_usuario.nome, "email": novo_usuario.email, "tipo": novo_usuario.tipo}

# --- Endpoints de Matérias e Simulados ---
# Contém as rotas para listar, criar e buscar matérias e simulados.

@app.get("/materias", response_model=List[Materia])
def get_materias(database: Session = Depends(get_db)):
    """Retorna todas as matérias cadastradas."""
    materias_db = database.query(db.Materia).all()
    materias_pydantic = []
    for materia_db in materias_db:
        simulados_info = [SimuladoInfo(id=s.id, nome=s.titulo) for s in materia_db.simulados]
        materias_pydantic.append(Materia(id=materia_db.id, nome=materia_db.nome, simulados=simulados_info))
    return materias_pydantic

@app.post("/materias", response_model=Materia)
def create_materia(materia_data: MateriaCreate, database: Session = Depends(get_db)):
    """Cria uma nova matéria."""
    nova_materia = db.Materia(id=str(uuid.uuid4()), nome=materia_data.nome)
    database.add(nova_materia)
    database.commit()
    database.refresh(nova_materia)
    return nova_materia

@app.get("/simulados/{id_simulado}", response_model=SimuladoCompleto)
def get_simulado(id_simulado: str, database: Session = Depends(get_db)):
    """Busca um simulado completo pelo seu ID."""
    simulado = database.query(db.Simulado).filter(db.Simulado.id == id_simulado).first()
    if not simulado:
        raise HTTPException(status_code=404, detail="Simulado não encontrado")
    
    questoes = []
    for q in simulado.questoes:
        questoes.append(Questao(
            id=q.id,
            pergunta=q.pergunta,
            opcoes=json.loads(q.opcoes),
            correta=q.correta,
            explicacoes=json.loads(q.explicacoes)
        ))

    return SimuladoCompleto(
        id=simulado.id,
        titulo=simulado.titulo,
        questoes=questoes
    )

# --- Endpoints de Resultados ---
# Contém as rotas para registrar e consultar os resultados dos simulados.

@app.post("/simulados/{simulado_id}/resultados", response_model=Resultado)
def registrar_resultado(simulado_id: str, resultado: ResultadoCreate, database: Session = Depends(get_db)):
    """Registra o resultado de um simulado para um usuário, atualizando a nota se a nova for maior."""
    resultado_existente = database.query(db.Resultado).filter(
        db.Resultado.usuario_id == resultado.usuario_id,
        db.Resultado.simulado_id == simulado_id
    ).first()

    if resultado_existente:
        if resultado.nota > resultado_existente.nota:
            # Atualiza a nota e as respostas se a nova nota for maior
            resultado_existente.nota = resultado.nota
            resultado_existente.respostas = json.dumps(resultado.respostas)
            database.commit()
            database.refresh(resultado_existente)
            
        # Após a possível atualização, o 'resultado_existente' tem a maior nota.
        # Construímos o objeto de resposta a partir dele.
        return Resultado(
            id=resultado_existente.id,
            usuario_id=resultado_existente.usuario_id,
            usuario_nome=resultado.usuario_nome,
            simulado_id=resultado_existente.simulado_id,
            nota=resultado_existente.nota,
            respostas=json.loads(resultado_existente.respostas)
        )
    else:
        # Se não existe, cria um novo resultado
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
        
        # Constrói o objeto de resposta a partir do novo resultado
        return Resultado(
            id=novo_resultado.id,
            usuario_id=novo_resultado.usuario_id,
            usuario_nome=resultado.usuario_nome,
            simulado_id=novo_resultado.simulado_id,
            nota=novo_resultado.nota,
            respostas=resultado.respostas
        )

@app.get("/simulados/{simulado_id}/resultados", response_model=List[Resultado])
def listar_resultados(simulado_id: str, database: Session = Depends(get_db)):
    """Lista todos os resultados de um simulado específico."""
    resultados = database.query(db.Resultado).filter(db.Resultado.simulado_id == simulado_id).all()
    # The Pydantic model expects a dictionary for 'respostas', but the database stores it as a JSON string.
    # We need to load it back into a dictionary before returning.
    return [
        Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=database.query(db.Usuario).filter(db.Usuario.id == r.usuario_id).first().nome,
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]

@app.get("/resultados/{usuario_id}", response_model=List[Resultado])
def get_resultados_usuario(usuario_id: str, database: Session = Depends(get_db)):
    """Busca todos os resultados de um usuário específico."""
    resultados = database.query(db.Resultado).filter(db.Resultado.usuario_id == usuario_id).all()
    return [
        Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=database.query(db.Usuario).filter(db.Usuario.id == r.usuario_id).first().nome,
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]

@app.get("/resultados")
def get_todos_resultados(database: Session = Depends(get_db)):
    """Busca todos os resultados de todos os simulados (útil para o professor)."""
    resultados = database.query(db.Resultado).all()
    return [
        Resultado(
            id=r.id,
            usuario_id=r.usuario_id,
            usuario_nome=database.query(db.Usuario).filter(db.Usuario.id == r.usuario_id).first().nome,
            simulado_id=r.simulado_id,
            nota=r.nota,
            respostas=json.loads(r.respostas)
        ) for r in resultados
    ]
# --- Geração de Simulados com IA (Gemini) ---

@app.post("/materias/{id_materia}/simulados", response_model=SimuladoCompleto)
async def create_simulado_from_gemini(
    id_materia: str,
    nome_simulado: str = Form(...),
    arquivo: UploadFile = Form(...),
    database: Session = Depends(get_db)
):
    """Cria um simulado a partir de um arquivo (PDF ou TXT) usando a API do Gemini."""
    materia = database.query(db.Materia).filter(db.Materia.id == id_materia).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")

    # Lê o conteúdo do arquivo enviado.
    texto_base = ""
    try:
        conteudo_bytes = await arquivo.read()
        if arquivo.content_type == "application/pdf" or arquivo.filename.lower().endswith('.pdf'):
            pdf_file = io.BytesIO(conteudo_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                texto_base += page.extract_text() + "\n"
            if not texto_base:
                 raise HTTPException(status_code=400, detail="Não foi possível extrair texto do PDF.")
        else:
            texto_base = conteudo_bytes.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Não foi possível ler o arquivo: {e}")

    # Monta o prompt para a IA com as instruções e o texto base.
    prompt = f'''
    Baseado no seguinte texto, gere um simulado de 5 questões de múltipla escolha (a, b, c, d, e).
    Para CADA questão, forneça a pergunta, as 5 opções, a letra da opção correta, e uma breve explicação para cada uma das 5 opções.
    RETORNE A RESPOSTA ESTRITAMENTE NO SEGUINTE FORMATO JSON (NÃO inclua markdown \'\'\'```json\'\'\' ou qualquer outro texto fora do JSON):
    {{
      "questoes": [
        {{
          "id": 1,
          "pergunta": "...",
          "opcoes": {{ "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." }},
          "correta": "a",
          "explicacoes": {{ "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." }}
        }}
      ]
    }}
    TEXTO BASE:
    ---
    {texto_base}
    ---
    '''

    # Envia o prompt para a API do Gemini e processa a resposta.
    try:
        print(">>> CHAMANDO API DO GEMINI (AGUARDE...) <<<")
        model = genai.GenerativeModel('gemini-2.5-flash') # Usando um modelo mais recente
        response = await model.generate_content_async(prompt)

        # Limpa e converte a resposta da IA para JSON.
        texto_resposta = response.text.strip()
        if texto_resposta.startswith("```json"):
            texto_resposta = texto_resposta[7:]
        if texto_resposta.endswith("```"):
            texto_resposta = texto_resposta[:-3]
        texto_resposta = texto_resposta.strip()
        
        resposta_json = json.loads(texto_resposta)

        # Cria e armazena o novo simulado no banco de dados.
        novo_simulado_id = str(uuid.uuid4())
        novo_simulado = db.Simulado(id=novo_simulado_id, titulo=nome_simulado, materia_id=id_materia)
        database.add(novo_simulado)
        database.commit()

        questoes = []
        for q in resposta_json['questoes']:
            nova_questao = db.Questao(
                id=q['id'],
                simulado_id=novo_simulado_id,
                pergunta=q['pergunta'],
                opcoes=json.dumps(q['opcoes']),
                correta=q['correta'],
                explicacoes=json.dumps(q['explicacoes'])
            )
            database.add(nova_questao)
            questoes.append(Questao(**q))

        database.commit()

        return SimuladoCompleto(
            id=novo_simulado_id,
            titulo=nome_simulado,
            questoes=questoes
        )
    except (ValidationError, json.JSONDecodeError) as e:
        print(f"ERRO ao processar resposta do Gemini: {e}")
        print(f"RESPOSTA RECEBIDA: {response.text}")
        raise HTTPException(status_code=500, detail="Erro ao processar a resposta da IA.")
    except Exception as e:
        print(f"ERRO AO CHAMAR GEMINI: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na comunicação com a API da IA: {e}")
