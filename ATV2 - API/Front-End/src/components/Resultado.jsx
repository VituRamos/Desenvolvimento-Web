// src/components/Resultado.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Resultado({ questoes, respostas, onRestart }) {
  const navigate = useNavigate();

  const acertos = questoes.filter(
    (q) => respostas[q.id]?.escolha === q.correta
  ).length;

  // *** ATUALIZADO: Lê do localStorage para decidir a rota ***
  const handleVoltarMenu = () => {
    const userType = localStorage.getItem('userType'); // Pega o tipo salvo no login
    if (userType === 'professor') {
      navigate('/professor'); // Vai para o dashboard do professor
    } else {
      navigate('/aluno'); // Vai para o dashboard do aluno (ou como padrão)
    }
  };
  // *** FIM DA ATUALIZAÇÃO ***

  return (
    <div className="resultado-container">
      <h3>Resultado do Simulado</h3>
      <p>
        Você acertou <strong id="acertos">{acertos}</strong> de{" "}
        <strong id="total">{questoes.length}</strong> questões.
      </p>

      {/* Gabarito (igual) */}
      <div id="gabarito">
        {/* ... (map das questões igual) ... */}
         {questoes.map((q) => {
          const escolha = respostas[q.id]?.escolha;
          const correta = escolha === q.correta;
          return (
            <p key={q.id} className={correta ? "correct" : "incorrect"}>
              <strong>Questão {q.id}:</strong> {q.pergunta} <br />
              <strong>Sua resposta:</strong> {escolha?.toUpperCase() || "N/A"} |{" "}
              <strong>Resposta correta:</strong> {q.correta.toUpperCase()}
            </p>
          );
        })}
      </div>

      {/* Botão Refazer (igual) */}
      <button id="restart-btn" className="btn" onClick={onRestart}>
        Refazer Simulado
      </button>

      {/* Botão Voltar ao Menu (agora chama a função atualizada) */}
      <button
        id="back-menu-btn"
        className="btn"
        onClick={handleVoltarMenu} // Chama a nova função
        style={{ marginTop: '10px', background: '#6c757d' }}
      >
        Voltar ao Menu
      </button>
    </div>
  );
}