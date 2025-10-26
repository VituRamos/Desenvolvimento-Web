import React from "react";

export default function Questao({ questao, resposta, onResponder, bloqueada }) {
  return (
    <div className="question">
      <h3>Questão {questao.id}</h3>
      <p>{questao.pergunta}</p>
      <div className="options">
        {Object.entries(questao.opcoes).map(([letra, texto]) => {
          const selecionada = resposta?.escolha === letra;
          const correta = questao.correta === letra;
          const incorreta = selecionada && resposta?.escolha !== questao.correta;

          return (
            <div
              key={letra}
              className={`option 
                ${selecionada ? "selected" : ""} 
                ${correta && resposta ? "correct" : ""} 
                ${incorreta ? "incorrect" : ""}`}
              onClick={() => !bloqueada && onResponder(questao.id, letra)}
            >
              {letra}) {texto}
              {/* Explicação aparece só depois de responder */}
              {resposta && (correta || incorreta) && (
                <div
                  className={`explanation ${
                    correta ? "correct" : incorreta ? "incorrect" : ""
                  }`}
                >
                  <span className="material-icons">
                    {correta ? "check" : "close"}
                  </span>
                  {questao.explicacoes[letra]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
