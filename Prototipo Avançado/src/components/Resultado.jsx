import React from "react";

export default function Resultado({ questoes, respostas, onRestart }) {
  const acertos = questoes.filter(
    (q) => respostas[q.id]?.escolha === q.correta
  ).length;

  return (
    <div className="resultado-container">
      <h3>Resultado do Simulado</h3>
      <p>
        Você acertou <strong id="acertos">{acertos}</strong> de{" "}
        <strong id="total">{questoes.length}</strong> questões.
      </p>

      <div id="gabarito">
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

      <button id="restart-btn" className="btn" onClick={onRestart}>
        Refazer Simulado
      </button>
    </div>
  );
}
