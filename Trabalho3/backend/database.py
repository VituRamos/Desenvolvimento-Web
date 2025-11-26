
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import json
import config

engine = create_engine(config.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha = Column(String, nullable=True)
    tipo = Column(String)
    resultados = relationship("Resultado", back_populates="usuario")

class Materia(Base):
    __tablename__ = "materias"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, index=True)
    simulados = relationship("Simulado", back_populates="materia")

class Simulado(Base):
    __tablename__ = "simulados"

    id = Column(String, primary_key=True, index=True)
    titulo = Column(String, index=True)
    materia_id = Column(String, ForeignKey("materias.id"))
    materia = relationship("Materia", back_populates="simulados")
    questoes = relationship("Questao", back_populates="simulado")
    resultados = relationship("Resultado", back_populates="simulado")

class Questao(Base):
    __tablename__ = "questoes"

    id = Column(String, primary_key=True, index=True)
    simulado_id = Column(String, ForeignKey("simulados.id"))
    pergunta = Column(String)
    opcoes = Column(Text)  # Store options as a JSON string
    correta = Column(String)
    explicacoes = Column(Text)  # Store explanations as a JSON string
    simulado = relationship("Simulado", back_populates="questoes")

class Resultado(Base):
    __tablename__ = "resultados"

    id = Column(String, primary_key=True, index=True)
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    simulado_id = Column(String, ForeignKey("simulados.id"))
    nota = Column(Float)
    respostas = Column(Text)  # Store answers as a JSON string
    usuario = relationship("Usuario", back_populates="resultados")
    simulado = relationship("Simulado", back_populates="resultados")


def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_db_and_tables()
