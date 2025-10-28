import React, { useState, useEffect } from 'react';
import Header from '../ui/Header';
import MateriaCard from '../materia/MateriaCard';
import "../../index.css";

export default function DashboardAluno() {
  const [materias, setMaterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState({});

  // 🔄 NOVO: Carregar resultados do aluno
  useEffect(() => {
    const carregarResultadosAluno = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`http://127.0.0.1:8000/resultados/${userId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Converter array para objeto por simulado_id
            const resultadosPorSimulado = {};
            data.forEach(resultado => {
              resultadosPorSimulado[resultado.simulado_id] = resultado;
            });
            
            setResultados(resultadosPorSimulado);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar resultados:", error);
      }
    };

    carregarResultadosAluno();
  }, []);

  // useEffect original para carregar matérias
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/materias');
        if (!response.ok) {
          throw new Error('Não foi possível buscar os dados das matérias.');
        }
        const data = await response.json();
        setMaterias(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, []);

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

  return (
    <div className="student-dashboard-container">
      <Header />
      {materias.length > 0 ? (
        materias.map((materia) => (
          <MateriaCard 
            key={materia.id} 
            materia={materia} 
            resultados={resultados} // 🔄 PASSAR RESULTADOS
          />
        ))
      ) : (
        <p style={{ textAlign: 'center', color: 'black', fontSize: '1.2rem' }}>Nenhuma matéria encontrada.</p>
      )}
    </div>
  );
}
