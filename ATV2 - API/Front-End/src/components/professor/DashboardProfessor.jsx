// src/components/DashboardProfessor.jsx

// ... (todas as importações: useEffect, useState, Header, etc. Ficam iguais)
import { useEffect, useState } from "react";
import Header from "../ui/Header";
import CardMateriaProf from "../materia/CardMateriaProf.jsx";
import PopupMateria from "../materia/PopupMateria";
import PopupSimulado from "../simulado/PopupSimulado";
import { useLocation } from "react-router-dom";
import CardAluno from "../professor/CardAluno"
import "../../index.css";

const API_URL = "http://127.0.0.1:8000";

export default function DashboardProfessor() {
  // ... (todos os useState: materias, popupMateriaAberto, etc. Ficam iguais)
  const [materias, setMaterias] = useState([]);
  const [popupMateriaAberto, setPopupMateriaAberto] = useState(false);
  const [popupSimuladoAberto, setPopupSimuladoAberto] = useState(false);
  const [materiaIdSelecionada, setMateriaIdSelecionada] = useState(null);
  const [resultados, setResultados] = useState({});
  

  const location = useLocation();
  const usuario = location.state?.usuario;

  // Função para buscar resultados do simulado
  useEffect(() => {
    const carregarResultados = async () => {
      try {
        const novosResultados = {};
        // Para cada matéria
        for (const materia of materias) {
          if (!materia.simulados) continue;
          // Para cada simulado da matéria
          for (const simulado of materia.simulados) {
            const res = await fetch(`${API_URL}/simulados/${simulado.id}/resultados`);
            if (!res.ok) continue;
            const data = await res.json();
            novosResultados[simulado.id] = data;
            novosResultados[simulado.id] = [
              { id: 2368080, nome: "João da Silva", pontuacao: 5 },
              { id: 2368081, nome: "Maria Souza", pontuacao: 8 }
            ];
            console.log("🔍 Resultados carregados:", novosResultados); 
          }
        }
        setResultados(novosResultados);
      } catch (error) {
        console.error("Erro ao carregar resultados:", error);
      }
    };
    carregarResultados();
  }, [materias]);

  // ... (useEffect e adicionarMateria ficam iguais)
  useEffect(() => {
    const carregarMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`);
        if (!response.ok) {
          throw new Error("Falha ao buscar matérias da API");
        }
        const data = await response.json();
        setMaterias(data);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar as matérias.");
      }
    };
    carregarMaterias();
  }, []);

  const adicionarMateria = async (nome) => {
    try {
      const response = await fetch(`${API_URL}/materias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: nome }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar matéria");
      }
      
      const novaMateria = await response.json();
      setMaterias([...materias, novaMateria]);
      
    } catch (error) {
      console.error(error);
      alert("Não foi possível adicionar a matéria.");
    }
  };

  const handleAbrirPopupSimulado = (idMateria) => {
    setMateriaIdSelecionada(idMateria);
    setPopupSimuladoAberto(true);
  };

  const handleFecharPopupSimulado = () => {
    setPopupSimuladoAberto(false);
    setMateriaIdSelecionada(null);
  };
  
  // ====================================================================
  // 1. ATUALIZADO: LÓGICA DE UPLOAD DO SIMULADO
  // ====================================================================
  const adicionarSimulado = async (idMateria, nome, arquivo) => {
    // Para enviar arquivos, precisamos usar 'FormData'
    const formData = new FormData();
    formData.append("nome_simulado", nome);
    formData.append("arquivo", arquivo);

    try {
      // Faz a chamada POST para o endpoint de criar simulado
      const response = await fetch(`${API_URL}/materias/${idMateria}/simulados`, {
        method: "POST",
        // ATENÇÃO: Não definimos 'Content-Type'. O navegador faz isso
        // automaticamente quando usamos FormData, o que é essencial.
        body: formData, 
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(`Falha ao criar simulado: ${erro.detail}`);
      }
      
      const novoSimulado = await response.json(); // Pega o simulado criado (com questões mock)
      console.log("Simulado criado com sucesso:", novoSimulado);

      // Atualiza o estado local para mostrar o novo simulado na tela
      setMaterias(prevMaterias =>
        prevMaterias.map(materia => {
          if (materia.id === idMateria) {
            // Adiciona a informação resumida do novo simulado na matéria correta
            const infoSimulado = { id: novoSimulado.id, nome: novoSimulado.titulo };
            return {
              ...materia,
              simulados: [...materia.simulados, infoSimulado],
            };
          }
          return materia;
        })
      );
      
      handleFecharPopupSimulado(); // Fecha o popup
      
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ... (o 'return' com o JSX fica exatamente igual)
  return (
    <div className="container">
      <Header />

      {materias.map((materia) => (
        <CardMateriaProf
          key={materia.id}
          materia={materia}
          resultados={resultados} 
          onAdicionarSimulado={() => handleAbrirPopupSimulado(materia.id)}
        />
      ))}

      <button className="fab" onClick={() => setPopupMateriaAberto(true)}>
        +
      </button>

      {popupMateriaAberto && (
        <PopupMateria
          onClose={() => setPopupMateriaAberto(false)}
          onConfirm={adicionarMateria}
        />
      )}
      
      {popupSimuladoAberto && (
        <PopupSimulado
          onClose={handleFecharPopupSimulado}
          onConfirm={(nome, arquivo) => adicionarSimulado(materiaIdSelecionada, nome, arquivo)}
        />
      )}
    </div>
  );
}
