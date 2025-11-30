// --- Bloco de Importação ---
import React, { useState, useEffect } from 'react';
import Header from '../ui/Header';
import MateriaCard from '../materia/MateriaCard';
import apiRequest from '../../services/api'; // Importa o serviço da API
import "../../index.css";

// --- Componente DashboardAluno ---
export default function DashboardAluno() {
  // --- Estados do Componente ---
  const [materias, setMaterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState({});

  // --- Efeito para Carregar Dados Iniciais ---
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error("ID do usuário não encontrado.");
        }

        // Carrega matérias e resultados em paralelo
        const [materiasData, resultadosData] = await Promise.all([
          apiRequest("/materias"),
          apiRequest(`/resultados/${userId}`),
        ]);

        setMaterias(materiasData);

        const resultadosPorSimulado = {};
        resultadosData.forEach(resultado => {
          resultadosPorSimulado[resultado.simulado_id] = resultado;
        });
        setResultados(resultadosPorSimulado);

      } catch (err) {
        setError(err.message);
        console.error("Erro ao carregar dados do dashboard do aluno:", err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  // --- Renderização Condicional ---
  if (isLoading) {
    return (
      <div className="student-dashboard-container">
        <Header />
        <p style={{ textAlign: 'center', color: 'black', fontSize: '1.2rem' }}>Carregando matérias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard-container">
        <Header />
        <p style={{ textAlign: 'center', color: 'red', fontSize: '1.2rem' }}>Erro: {error}</p>
      </div>
    );
  }

  // --- Renderização Principal ---
  return (
    <div className="student-dashboard-container">
      <Header />
      {materias.length > 0 ? (
        materias.map((materia) => (
          <MateriaCard 
            key={materia.id} 
            materia={materia} 
            resultados={resultados} 
          />
        ))
      ) : (
        <p style={{ textAlign: 'center', color: 'black', fontSize: '1.2rem' }}>Nenhuma matéria encontrada.</p>
      )}
    </div>
  );
}
