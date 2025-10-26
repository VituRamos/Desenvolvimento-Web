import React, { useState, useEffect } from 'react';
import Header from '../ui/Header';
import MateriaCard from '../materia/MateriaCard';
import "../../index.css";

/**
 * Componente do Dashboard do Aluno.
 * Exibe as matérias disponíveis com seus respectivos simulados.
 * Os dados são buscados dinamicamente da API.
 */
export default function DashboardAluno() {
  // Estado para armazenar a lista de matérias vindas da API.
  const [materias, setMaterias] = useState([]);
  // Estado para controlar a exibição da mensagem de carregamento.
  const [isLoading, setIsLoading] = useState(true);
  // Estado para armazenar mensagens de erro, caso a API falhe.
  const [error, setError] = useState(null);

  // useEffect para buscar os dados da API quando o componente é montado.
  useEffect(() => {
    // Função assíncrona para buscar as matérias.
    const fetchMaterias = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/materias');
        if (!response.ok) {
          // Se a resposta da API não for bem-sucedida, lança um erro.
          throw new Error('Não foi possível buscar os dados das matérias.');
        }
        const data = await response.json();
        setMaterias(data); // Atualiza o estado com os dados da API.
      } catch (error) {
        // Em caso de erro na chamada, atualiza o estado de erro.
        setError(error.message);
      } finally {
        // Independentemente de sucesso ou falha, para de exibir o carregamento.
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, []); // O array vazio [] garante que o useEffect só rode uma vez.

  // Renderiza a mensagem de carregamento enquanto os dados não chegam.
  if (isLoading) {
    return (
      <div className="student-dashboard-container">
        <Header />
        <p style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>Carregando matérias...</p>
      </div>
    );
  }

  // Renderiza uma mensagem de erro se a chamada à API falhar.
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
      {/* Mapeia as matérias do estado (vindas da API) para renderizar os cards. */}
      {materias.length > 0 ? (
        materias.map((materia) => (
          <MateriaCard key={materia.id} materia={materia} />
        ))
      ) : (
        <p style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>Nenhuma matéria encontrada.</p>
      )}
    </div>
  );
}
