// src/components/feedback/FeedbackPage.jsx
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Header from "../ui/Header";
import FeedbackCard from "./FeedbackCard";
import Actions from "../ui/Actions";
import apiRequest from "../../services/api"; // Importa o serviço da API
import "../../index.css";

/**
 * Página de Feedback (Gabarito Comentado).
 */
export default function FeedbackPage() {
  const { simuladoId } = useParams();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimuladoData = async () => {
      setLoading(true);
      try {
        const simulado = await apiRequest(`/simulados/${simuladoId}`);

        const itensDeFeedback = simulado.questoes.map((q) => ({
          titulo: `Questão ${q.n_questao}: ${q.pergunta}`,
          texto: `Resposta Correta: ${q.correta.toUpperCase()}. Explicação: ${q.explicacoes[q.correta]}`,
        }));

        const dataFormatada = {
          feedback: {
            titulo: `Gabarito Comentado: ${simulado.titulo}`,
            itens: itensDeFeedback,
          },
        };

        setFeedbackData(dataFormatada);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimuladoData();
  }, [simuladoId]);

  if (loading) {
    return (
        <div className="container">
            <Header />
            <p style={{ textAlign: 'center', color: 'white' }}>Carregando gabarito...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container">
            <Header />
            <p style={{ textAlign: 'center', color: 'red' }}>Erro: {error}</p>
        </div>
    );
  }

  if (!feedbackData) {
    return <div className="container">Nenhum dado de feedback encontrado.</div>;
  }

  return (
    <div className="container">
      <Header />
      <div className="feedback-container">
        <FeedbackCard
          titulo={feedbackData.feedback.titulo}
          itens={feedbackData.feedback.itens}
        />
        <Actions onVoltar={() => window.history.back()} />
      </div>
    </div>
  );
}
