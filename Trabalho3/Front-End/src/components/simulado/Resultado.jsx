// --- Bloco de Importação ---
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../services/api"; // Importa o serviço da API

// --- Componente Resultado ---
export default function Resultado({ questoes, respostas, onRestart, simuladoId }) {
  // --- Hooks e Estados ---
  const navigate = useNavigate();
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const jaSalvou = useRef(false);

  // --- Lógica de Cálculo ---
  const acertos = questoes.filter(
    (q) => respostas[q.id]?.escolha === q.correta
  ).length;
  const notaAtual = (acertos / questoes.length) * 10;

  // --- Efeito para Salvar o Resultado ---
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType === 'professor' || jaSalvou.current) {
      return;
    }

    const salvarResultado = async () => {
      jaSalvou.current = true;
      try {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        
        const respostasParaSalvar = Object.entries(respostas).reduce((acc, [id, resp]) => {
          acc[id] = resp.escolha;
          return acc;
        }, {});

        const resultadoData = {
          usuario_id: userId,
          usuario_nome: userName,
          simulado_id: simuladoId,
          nota: notaAtual,
          respostas: respostasParaSalvar
        };

        const data = await apiRequest(`/simulados/${simuladoId}/resultados`, {
          method: 'POST',
          body: JSON.stringify(resultadoData),
        });

        setResultadoFinal(data);

      } catch (error) {
        console.error('Erro ao salvar resultado:', error);
        jaSalvou.current = false;
      }
    };

    salvarResultado();
  }, [acertos, questoes.length, respostas, simuladoId, notaAtual]);

  // --- Funções de Navegação ---
  const handleVoltarMenu = () => {
    const userType = localStorage.getItem('userType');
    if (userType === 'professor') {
      navigate('/professor');
    } else {
      navigate('/aluno');
    }
  };

  const notaExibida = resultadoFinal ? resultadoFinal.nota : notaAtual;
  const acertosExibidos = resultadoFinal ? (resultadoFinal.nota / 10) * questoes.length : acertos;

  // --- Renderização do Componente ---
  return (
    <div className="resultado-container">
      <h3>Resultado do Simulado</h3>
       <p>
        Você acertou <strong id="acertos">{Math.round(acertosExibidos)}</strong> de{" "}
        <strong id="total">{questoes.length}</strong> questões. (Nota: {notaExibida.toFixed(2)})
      </p>

      <div id="gabarito">
         {questoes.map((q) => {
          const escolha = respostas[q.id]?.escolha;
          const correta = escolha === q.correta;
          return (
            <p key={q.id} className={correta ? "correct" : "incorrect"}>
              <strong>Questão {q.n_questao}:</strong> {q.pergunta} <br />
              <strong>Sua resposta:</strong> {escolha?.toUpperCase() || "N/A"} |{" "}
              <strong>Resposta correta:</strong> {q.correta.toUpperCase()}
            </p>
          );
        })}
      </div>

      <button id="restart-btn" className="btn" onClick={onRestart}>
        Refazer Simulado
      </button>

      <button
        id="back-menu-btn"
        className="btn"
        onClick={handleVoltarMenu}
        style={{ marginTop: '10px', background: '#6c757d' }}
      >
        Voltar ao Menu
      </button>
    </div>
  );
}
