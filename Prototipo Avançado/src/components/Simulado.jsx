import React, { useState } from "react";
import Questao from "./Questao";
import Resultado from "./Resultado";
import dados from "../data/simulado.json";

export default function Simulado() {
  const [current, setCurrent] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [finalizado, setFinalizado] = useState(false);

  const questoes = dados.questoes;

  const handleResponder = (id, escolha) => {
    // Guarda a escolha e marca que a questão foi respondida
    setRespostas({
      ...respostas,
      [id]: { escolha }
    });
  };

  const handleNext = () => {
    if (current < questoes.length - 1) {
      setCurrent(current + 1);
    } else {
      setFinalizado(true);
    }
  };

  const handleRestart = () => {
    setRespostas({});
    setCurrent(0);
    setFinalizado(false);
  };

  return (
    <main className="simulado-container">
      <div className="simulado-header">
        <h2>{dados.titulo}</h2>
      </div>

      {!finalizado ? (
        <div className="quiz-container">
          <Questao
            questao={questoes[current]}
            resposta={respostas[questoes[current].id]}
            onResponder={handleResponder}
            bloqueada={!!respostas[questoes[current].id]} // trava depois de escolher
          />

          <div className="actions">
            <button id="next-btn" className="btn" onClick={handleNext}>
              {current < questoes.length - 1 ? "Próximo" : "Finalizar"}
            </button>
          </div>
        </div>
      ) : (
        <Resultado
          questoes={questoes}
          respostas={respostas}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
