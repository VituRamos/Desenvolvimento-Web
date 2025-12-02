# backend/database.py

from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

# --- Configuração do Banco de Dados ---

# Tenta pegar a URL da variável de ambiente. 
DATABASE_URL = os.environ.get("DATABASE_URL")

# CORREÇÃO PARA POSTGRESQL NA VERCEL:
# O SQLAlchemy exige "postgresql://" mas alguns providers retornam "postgres://"
connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Definição dos Modelos ---

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha = Column(String, nullable=True)
    tipo = Column(String)
    
    # Relação: Usuário pode ter vários Resultados
    resultados = relationship("Resultado", back_populates="usuario")

class Materia(Base):
    __tablename__ = "materias"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, index=True)
    
    # Relação: Matéria pode ter vários Simulados
    simulados = relationship("Simulado", back_populates="materia")

class Simulado(Base):
    __tablename__ = "simulados"

    id = Column(String, primary_key=True, index=True)
    titulo = Column(String, index=True)
    materia_id = Column(String, ForeignKey("materias.id"))
    
    # Relações bidirecionais
    materia = relationship("Materia", back_populates="simulados")
    questoes = relationship("Questao", back_populates="simulado")
    resultados = relationship("Resultado", back_populates="simulado")

class Questao(Base):
    __tablename__ = "questoes"

    id = Column(String, primary_key=True, index=True)
    n_questao = Column(Integer)
    simulado_id = Column(String, ForeignKey("simulados.id"))
    pergunta = Column(String)
    opcoes = Column(Text)  # Store options as a JSON string
    correta = Column(String)
    explicacoes = Column(Text)  # Store explanations as a JSON string
    
    # Relação: Questão pertence a um Simulado
    simulado = relationship("Simulado", back_populates="questoes")

class Resultado(Base):
    __tablename__ = "resultados"

    id = Column(String, primary_key=True, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    simulado_id = Column(String, ForeignKey("simulados.id"))
    nota = Column(Float)
    respostas = Column(Text)  # Store answers as a JSON string
    
    # Relações bidirecionais
    usuario = relationship("Usuario", back_populates="resultados")
    simulado = relationship("Simulado", back_populates="resultados") 


# --- Funções de DB ---

def create_db_and_tables():
    """Cria o banco de dados e as tabelas, se elas não existirem."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Gera uma sessão de DB para ser usada como dependência no FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    create_db_and_tables()
