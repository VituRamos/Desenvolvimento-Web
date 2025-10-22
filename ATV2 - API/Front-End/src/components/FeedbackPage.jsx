// src/components/FeedbackPage.jsx

// Importa o hook useParams
import { useParams } from "react-router-dom";
// Importa useEffect e useState para o futuro fetch
import React, { useState, useEffect } from "react";
import Header from "./Header";
import AlunoInfo from "./AlunoInfo";
import FeedbackCard from "./FeedbackCard";
import Actions from "./Actions";
import "../index.css";

const API_URL = "http://127.0.0.1:8000";

export default function FeedbackPage() {
  // Pega o ID do simulado da URL
  const { simuladoId } = useParams();

  // Estado para guardar o feedback (ainda usando mock)
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(false); // Mudaremos para true quando o fetch for implementado
  const [error, setError] = useState(null);

  // TODO: Implementar useEffect para buscar feedback da API
  // useEffect(() => {
  //   const fetchFeedback = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       // const response = await fetch(`${API_URL}/feedback/${simuladoId}`); // Exemplo de endpoint futuro
  //       // if (!response.ok) throw new Error("Feedback não encontrado");
  //       // const data = await response.json();
  //
  //       // MOCK TEMPORÁRIO até ter o endpoint
  //       const data = {
  //         aluno: { nome: "Nome do Aluno (API)", id: "12345 (API)" }, // Exemplo
  //         feedback: {
  //           titulo: `Feedback Simulado ID: ${simuladoId}`,
  //           itens: [
  //             { titulo: "Pontos Fortes", texto: "Dados da API..." },
  //             { titulo: "Pontos a Melhorar", texto: "Dados da API..." },
  //             { titulo: "Sugestões", texto: "Dados da API..." },
  //           ],
  //         },
  //       };
  //       setFeedbackData(data);
  //
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchFeedback();
  // }, [simuladoId]);

  // Usando dados mockados enquanto não há API
  useEffect(() => {
    // Simulando uma carga rápida e usando dados mockados
    setLoading(true);
    setTimeout(() => { // Simula a espera da API
        const mockData = {
          aluno: { nome: "Aluno Exemplo", id: "Aluno001" },
          feedback: {
            titulo: `Feedback do Simulado (ID: ${simuladoId})`, // Usa o ID da URL no título
            itens: [
              {
                titulo: "Pontos Fortes",
                texto: "O aluno demonstrou bom conhecimento em gramática e interpretação de texto.",
              },
              {
                titulo: "Pontos a Melhorar",
                texto: "O aluno precisa focar mais em figuras de linguagem e literatura.",
              },
              {
                titulo: "Sugestões",
                texto: "Recomendamos a leitura de 'Dom Casmurro' e a revisão dos exercícios sobre metáforas.",
              },
            ],
          },
        };
        setFeedbackData(mockData);
        setLoading(false);
    }, 500); // Espera 0.5 segundos
  }, [simuladoId]);


  if (loading) {
    return <div className="container">Carregando feedback...</div>;
  }

  if (error) {
    return <div className="container">Erro: {error}</div>;
  }

  if (!feedbackData) {
    return <div className="container">Nenhum dado de feedback encontrado.</div>;
  }

  return (
    <div className="container">
      <Header />
      <div className="feedback-container">
        {/* Usa dados do aluno (ainda mockados) */}
        <AlunoInfo nome={feedbackData.aluno.nome} id={feedbackData.aluno.id} />
        {/* Usa dados do feedback (ainda mockados) */}
        <FeedbackCard
          titulo={feedbackData.feedback.titulo}
          itens={feedbackData.feedback.itens}
        />
        {/* Botão de voltar */}
        <Actions onVoltar={() => window.history.back()} />
      </div>
    </div>
  );
}