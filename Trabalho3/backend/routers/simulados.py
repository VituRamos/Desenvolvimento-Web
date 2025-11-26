# backend/routers/simulados.py
import uuid
import json
import io
from fastapi import APIRouter, HTTPException, Depends, UploadFile, Form
from pydantic import ValidationError
from sqlalchemy.orm import Session
import google.generativeai as genai
from pypdf import PdfReader

import database as db
import schemas

router = APIRouter()

from dependencies import get_db

@router.get("/simulados/{id_simulado}", response_model=schemas.SimuladoCompleto, tags=["Simulados"])
def get_simulado(id_simulado: str, database: Session = Depends(get_db)):
    simulado = database.query(db.Simulado).filter(db.Simulado.id == id_simulado).first()
    if not simulado:
        raise HTTPException(status_code=404, detail="Simulado não encontrado")
    
    questoes = []
    for q in simulado.questoes:
        questoes.append(schemas.Questao(
            id=q.id,
            n_questao=q.n_questao,
            pergunta=q.pergunta,
            opcoes=json.loads(q.opcoes),
            correta=q.correta,
            explicacoes=json.loads(q.explicacoes)
        ))

    return schemas.SimuladoCompleto(id=simulado.id, titulo=simulado.titulo, questoes=questoes)

@router.delete("/simulados/{simulado_id}", status_code=204, tags=["Simulados"])
def delete_simulado(simulado_id: str, database: Session = Depends(get_db)):
    """Apaga um simulado e todas as suas dependências (resultados e questões)."""
    simulado = database.query(db.Simulado).filter(db.Simulado.id == simulado_id).first()
    if not simulado:
        raise HTTPException(status_code=404, detail="Simulado não encontrado")

    # Apaga dependências
    database.query(db.Resultado).filter(db.Resultado.simulado_id == simulado_id).delete()
    database.query(db.Questao).filter(db.Questao.simulado_id == simulado_id).delete()
    
    # Apaga o simulado
    database.delete(simulado)
    database.commit()
    return

@router.post("/materias/{id_materia}/simulados", response_model=schemas.SimuladoCompleto, tags=["Simulados"])
async def create_simulado_from_gemini(
    id_materia: str,
    nome_simulado: str = Form(...),
    arquivo: UploadFile = Form(...),
    database: Session = Depends(get_db)
):
    materia = database.query(db.Materia).filter(db.Materia.id == id_materia).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")

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

    prompt = f'''
    Baseado no seguinte texto, gere um simulado de 5 questões de múltipla escolha (a, b, c, d, e).
    Para CADA questão, forneça a pergunta, as 5 opções, a letra da opção correta, e uma breve explicação para cada uma das 5 opções.
    RETORNE A RESPOSTA ESTRITAMENTE NO SEGUINTE FORMATO JSON (NÃO inclua markdown \'\'\'```json\''' ou qualquer outro texto fora do JSON):
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

    try:
        print(">>> CHAMANDO API DO GEMINI (AGUARDE...) <<<")
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(prompt)

        texto_resposta = response.text.strip()
        if texto_resposta.startswith("```json"):
            texto_resposta = texto_resposta[7:]
        if texto_resposta.endswith("```"):
            texto_resposta = texto_resposta[:-3]
        texto_resposta = texto_resposta.strip()
        
        resposta_json = json.loads(texto_resposta)

        novo_simulado_id = str(uuid.uuid4())
        novo_simulado = db.Simulado(id=novo_simulado_id, titulo=nome_simulado, materia_id=id_materia)
        database.add(novo_simulado)
        database.commit()

        questoes = []
        for q in resposta_json['questoes']:
            nova_questao = db.Questao(
                id=str(uuid.uuid4()), # Gera um ID único para cada questão
                n_questao=q['id'],   # O número da questão (1, 2, 3...)
                simulado_id=novo_simulado_id,
                pergunta=q['pergunta'],
                opcoes=json.dumps(q['opcoes']),
                correta=q['correta'],
                explicacoes=json.dumps(q['explicacoes'])
            )
            database.add(nova_questao)
            questoes.append(schemas.Questao(id=nova_questao.id, n_questao=nova_questao.n_questao, pergunta=q['pergunta'], opcoes=q['opcoes'], correta=q['correta'], explicacoes=q['explicacoes']))

        database.commit()

        return schemas.SimuladoCompleto(
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
