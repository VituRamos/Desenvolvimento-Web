# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict

# --- Schemas para Autenticação e Tokens ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Schemas de Usuário ---
class Usuario(BaseModel):
    id: str
    nome: str
    email: str
    senha: Optional[str] = None
    tipo: str

class LoginData(BaseModel):
    email: str
    senha: str

class GoogleAuthCode(BaseModel):
    code: str

# --- Schemas de Matérias e Simulados ---
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
    id: str # UUID único da questão
    n_questao: int # Número da questão (1, 2, 3...)
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

# --- Schemas de Resultados ---
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
