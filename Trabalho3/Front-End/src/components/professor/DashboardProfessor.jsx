// --- Bloco de Importação ---
import { useEffect, useState } from "react";
import Header from "../ui/Header";
import CardMateriaProf from "../materia/CardMateriaProf.jsx";
import PopupMateria from "../materia/PopupMateria";
import PopupSimulado from "../simulado/PopupSimulado";
import apiRequest from "../../services/api"; // Importa o serviço da API
import "../../index.css";

// --- Componente DashboardProfessor ---
export default function DashboardProfessor() {
  // --- Estados do Componente ---
  const [materias, setMaterias] = useState([]);
  const [popupMateriaAberto, setPopupMateriaAberto] = useState(false);
  const [popupSimuladoAberto, setPopupSimuladoAberto] = useState(false);
  const [materiaIdSelecionada, setMateriaIdSelecionada] = useState(null);
  const [resultados, setResultados] = useState({});
  
  // --- Efeito para Carregar Dados Iniciais ---
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carrega matérias e resultados em paralelo
        const [materiasData, resultadosData] = await Promise.all([
          apiRequest("/materias"),
          apiRequest("/resultados"),
        ]);
        
        setMaterias(materiasData);

        const resultadosAgrupados = resultadosData.reduce((acc, resultado) => {
          const { simulado_id } = resultado;
          if (!acc[simulado_id]) {
            acc[simulado_id] = [];
          }
          acc[simulado_id].push(resultado);
          return acc;
        }, {});
        setResultados(resultadosAgrupados);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        alert("Não foi possível carregar os dados do dashboard.");
      }
    };
    carregarDados();
  }, []);

  // --- Funções de Manipulação de Dados ---
  const adicionarMateria = async (nome) => {
    try {
      const novaMateria = await apiRequest("/materias", {
        method: "POST",
        body: JSON.stringify({ nome: nome }),
      });
      setMaterias([...materias, novaMateria]);
    } catch (error) {
      console.error(error);
      alert("Não foi possível adicionar a matéria.");
    }
  };

  const adicionarSimulado = async (idMateria, nome, arquivo) => {
    const formData = new FormData();
    formData.append("nome_simulado", nome);
    formData.append("arquivo", arquivo);

    try {
      const novoSimulado = await apiRequest(`/materias/${idMateria}/simulados`, {
        method: "POST",
        body: formData, 
      });

      setMaterias(prevMaterias =>
        prevMaterias.map(materia => {
          if (materia.id === idMateria) {
            const infoSimulado = { id: novoSimulado.id, nome: novoSimulado.titulo };
            return {
              ...materia,
              simulados: [...materia.simulados, infoSimulado],
            };
          }
          return materia;
        })
      );
      
      handleFecharPopupSimulado();
      
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleExcluirSimulado = async (materiaId, simuladoId) => {
    if (window.confirm("Tem certeza que deseja excluir este simulado? Esta ação não pode ser desfeita.")) {
      try {
        await apiRequest(`/simulados/${simuladoId}`, {
          method: "DELETE",
        });

        setMaterias(prevMaterias =>
          prevMaterias.map(materia => {
            if (materia.id === materiaId) {
              return {
                ...materia,
                simulados: materia.simulados.filter(s => s.id !== simuladoId),
              };
            }
            return materia;
          })
        );
      } catch (error) {
        console.error(error);
        alert("Não foi possível excluir o simulado.");
      }
    }
  };

  // --- Funções de Controle de UI ---
  const handleAbrirPopupSimulado = (idMateria) => {
    setMateriaIdSelecionada(idMateria);
    setPopupSimuladoAberto(true);
  };

  const handleFecharPopupSimulado = () => {
    setPopupSimuladoAberto(false);
    setMateriaIdSelecionada(null);
  };
  
  // --- Renderização Principal ---
  return (
    <div className="container">
      <Header />
      {materias.map((materia) => (
        <CardMateriaProf
          key={materia.id}
          materia={materia}
          resultados={resultados} 
          onAdicionarSimulado={() => handleAbrirPopupSimulado(materia.id)}
          onExcluirSimulado={(simuladoId) => handleExcluirSimulado(materia.id, simuladoId)}
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
