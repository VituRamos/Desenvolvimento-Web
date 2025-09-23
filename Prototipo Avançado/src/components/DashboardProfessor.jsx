import { useEffect, useState } from "react";
import Header from "./Header";
import CardMateria from "./CardMateria";
import PopupMateria from "./PopupMateria";
import PopupSimulado from "./PopupSimulado";
import dados from "../data/dadosProfessor.json";
import { useLocation } from "react-router-dom";
import "../index.css";

export default function DashboardProfessor() {
  const [materias, setMaterias] = useState([]);
  const [popupMateriaAberto, setPopupMateriaAberto] = useState(false);
  const [popupSimuladoAberto, setPopupSimuladoAberto] = useState(false);

  const location = useLocation();
  const usuario = location.state?.usuario; // pega usuário logado (passado no Login)

  // Carregar matérias do arquivo JSON
  useEffect(() => {
    setMaterias(dados.materias);
  }, []);

  // Adicionar nova matéria
  const adicionarMateria = (nome) => {
    const nova = {
      id: materias.length + 1,
      nome,
      simulados: []
    };
    setMaterias([...materias, nova]);
  };

  // Adicionar novo simulado em uma matéria
  const adicionarSimulado = (idMateria, nome, arquivo) => {
    setMaterias((prev) =>
      prev.map((m) =>
        m.id === idMateria
          ? {
              ...m,
              simulados: [
                ...m.simulados,
                { id: m.simulados.length + 1, nome, arquivo, alunos: [] }
              ]
            }
          : m
      )
    );
  };

  return (
    <div className="container">
      
      <Header />

      {materias.map((materia) => (
        <CardMateria
          key={materia.id}
          materia={materia}
          onAdicionarSimulado={() => setPopupSimuladoAberto(true)}
        />
      ))}

      {/* FAB para adicionar matéria */}
      <button className="fab" onClick={() => setPopupMateriaAberto(true)}>
        +
      </button>

      {/* POPUPS */}
      {popupMateriaAberto && (
        <PopupMateria
          onClose={() => setPopupMateriaAberto(false)}
          onConfirm={adicionarMateria}
        />
      )}
      {popupSimuladoAberto && (
        <PopupSimulado
          onClose={() => setPopupSimuladoAberto(false)}
          onConfirm={(nome, arquivo) => adicionarSimulado(1, nome, arquivo)}
        />
      )}
    </div>
  );
}
