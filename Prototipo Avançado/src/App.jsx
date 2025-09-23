import { useEffect, useState } from "react";
import Header from "./components/Header";
import CardMateria from "./components/CardMateria";
import PopupMateria from "./components/PopupMateria";
import PopupSimulado from "./components/PopupSimulado";
import dados from "./data/dados.json";
import "./index.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [popupMateriaAberto, setPopupMateriaAberto] = useState(false);
  const [popupSimuladoAberto, setPopupSimuladoAberto] = useState(false);

  useEffect(() => {
    setMaterias(dados.materias);
  }, []);

  const adicionarMateria = (nome) => {
    const nova = {
      id: materias.length + 1,
      nome,
      simulados: []
    };
    setMaterias([...materias, nova]);
  };

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

      {/* FAB */}
      <button className="fab" onClick={() => setPopupMateriaAberto(true)}>+</button>

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
