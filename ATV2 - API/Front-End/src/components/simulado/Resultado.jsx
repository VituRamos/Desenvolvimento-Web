// src/components/Resultado.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Resultado({ questoes, respostas, onRestart, simuladoId }) {
  const navigate = useNavigate();
  const [salvo, setSalvo] = useState(false);

  const acertos = questoes.filter(
    (q) => respostas[q.id]?.escolha === q.correta
  ).length;

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType === 'professor' || salvo) {
      return; // Não salva o resultado se for professor ou se já foi salvo
    }

    const salvarResultado = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        const nota = (acertos / questoes.length) * 10;

        const respostasParaSalvar = Object.entries(respostas).reduce((acc, [id, resp]) => {
          acc[id] = resp.escolha;
          return acc;
        }, {});

        const resultadoData = {
          usuario_id: userId,
          usuario_nome: userName,
          simulado_id: simuladoId,
          nota: nota,
          respostas: respostasParaSalvar
        };

        const response = await fetch(`http://127.0.0.1:8000/simulados/${simuladoId}/resultados`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultadoData),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar resultado');
        }

        const resultadoSalvo = await response.json();
        console.log('Resultado salvo:', resultadoSalvo);
        setSalvo(true); // Marca como salvo para evitar duplicação

      } catch (error) {
        console.error('Erro ao salvar resultado:', error);
      }
    };

    salvarResultado();
  }, [acertos, questoes.length, respostas, simuladoId, salvo]);

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
