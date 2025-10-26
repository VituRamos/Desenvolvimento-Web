// src/components/Simulado.jsx

//função para embaralhar as respostas (usada para embaralhar as opções)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
  }
}

import React, { useState, useEffect } from "react";
// Importa o hook useParams
import { useParams } from "react-router-dom";
import Questao from "./Questao";
import Resultado from "./Resultado";

const API_URL = "http://127.0.0.1:8000";

export default function Simulado() {
  const { simuladoId } = useParams();
  const [simuladoData, setSimuladoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [finalizado, setFinalizado] = useState(false);

  // useEffect para buscar os dados do simulado na API quando o componente montar
 useEffect(() => {
    const fetchSimulado = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/simulados/${simuladoId}`);
        if (!response.ok) {
          throw new Error("Simulado não encontrado ou falha na API");
        }
        const data = await response.json();

        // ----- INÍCIO DA LÓGICA DE EMBARALHAMENTO -----
        const questoesEmbaralhadas = data.questoes.map(questao => {
          const letrasOriginais = ['a', 'b', 'c', 'd', 'e'];
          const respostaCorretaOriginal = questao.opcoes[questao.correta];

          // Cria um array de objetos { letraOriginal: 'a', texto: 'Texto da opção a' }
          const opcoesParaEmbaralhar = letrasOriginais.map(letra => ({
            letraOriginal: letra,
            texto: questao.opcoes[letra],
            explicacao: questao.explicacoes[letra] // Leva a explicação junto
          }));

          // Embaralha o array de opções
          shuffleArray(opcoesParaEmbaralhar);

          // Remonta o objeto de opções e explicações com as novas letras
          const novasOpcoes = {};
          const novasExplicacoes = {};
          let novaLetraCorreta = '';

          opcoesParaEmbaralhar.forEach((opcao, index) => {
            const novaLetra = letrasOriginais[index]; // 'a', 'b', 'c', ... na nova ordem
            novasOpcoes[novaLetra] = opcao.texto;
            novasExplicacoes[novaLetra] = opcao.explicacao;

            // Se o texto desta opção for o da resposta correta original, guarda a nova letra
            if (opcao.texto === respostaCorretaOriginal) {
              novaLetraCorreta = novaLetra;
            }
          });

          // Retorna a questão com as opções e a letra correta atualizadas
          return {
            ...questao,
            opcoes: novasOpcoes,
            explicacoes: novasExplicacoes, // Atualiza as explicações também
            correta: novaLetraCorreta
          };
        });
        // ----- FIM DA LÓGICA DE EMBARALHAMENTO -----

        // Guarda os dados com as questões já embaralhadas
        setSimuladoData({ ...data, questoes: questoesEmbaralhadas });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulado();
  }, [simuladoId]); // O useEffect roda de novo se o simuladoId mudar

  const handleResponder = (id, escolha) => {
    setRespostas({ ...respostas, [id]: { escolha } });
  };

  const handleNext = () => {
    if (simuladoData && current < simuladoData.questoes.length - 1) {
      setCurrent(current + 1);
    } else {
      setFinalizado(true);
    }
  };

  const handleRestart = () => {
    setRespostas({});
    setCurrent(0);
    setFinalizado(false);
    // Refaz o fetch para embaralhar novamente (opcional, mas bom para refazer)
     const fetchSimulado = async () => {
        setLoading(true); setError(null);
        try { /* ... (código fetch + embaralhamento igual ao useEffect) ... */
             const response = await fetch(`${API_URL}/simulados/${simuladoId}`);
            if (!response.ok) throw new Error("Simulado não encontrado ou falha na API");
            const data = await response.json();
            const questoesEmbaralhadas = data.questoes.map(questao => {
                const letrasOriginais = ['a', 'b', 'c', 'd', 'e'];
                const respostaCorretaOriginal = questao.opcoes[questao.correta];
                const opcoesParaEmbaralhar = letrasOriginais.map(letra => ({ letraOriginal: letra, texto: questao.opcoes[letra], explicacao: questao.explicacoes[letra] }));
                shuffleArray(opcoesParaEmbaralhar);
                const novasOpcoes = {}; const novasExplicacoes = {}; let novaLetraCorreta = '';
                opcoesParaEmbaralhar.forEach((opcao, index) => {
                    const novaLetra = letrasOriginais[index];
                    novasOpcoes[novaLetra] = opcao.texto; novasExplicacoes[novaLetra] = opcao.explicacao;
                    if (opcao.texto === respostaCorretaOriginal) novaLetraCorreta = novaLetra;
                });
                return { ...questao, opcoes: novasOpcoes, explicacoes: novasExplicacoes, correta: novaLetraCorreta };
            });
            setSimuladoData({ ...data, questoes: questoesEmbaralhadas });
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchSimulado();
  };

  if (loading) return <div className="container">Carregando simulado...</div>;
  if (error) return <div className="container">Erro: {error}</div>;
  if (!simuladoData) return <div className="container">Nenhum dado de simulado encontrado.</div>;

  const questoes = simuladoData.questoes;

  return (
    <main className="simulado-container">
      <div className="simulado-header"><h2>{simuladoData.titulo}</h2></div>
      {!finalizado ? (
        <div className="quiz-container">
          <Questao
            questao={questoes[current]}
            resposta={respostas[questoes[current].id]}
            onResponder={handleResponder}
            bloqueada={!!respostas[questoes[current].id]}
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
