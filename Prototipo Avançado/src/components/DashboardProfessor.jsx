import { useEffect, useState } from "react";
import Header from "./Header";
import CardMateria from "./CardMateria";
import PopupMateria from "./PopupMateria";
import PopupSimulado from "./PopupSimulado";
import dados from "../data/dadosProfessor.json";
import { useLocation } from "react-router-dom";
import "../index.css";

// Componente para o painel do professor.
export default function DashboardProfessor() {
  // Estado para armazenar a lista de matérias.
  const [materias, setMaterias] = useState([]);
  // Estado para controlar a visibilidade do popup de adicionar matéria.
  const [popupMateriaAberto, setPopupMateriaAberto] = useState(false);
  // Estado para controlar a visibilidade do popup de adicionar simulado.
  const [popupSimuladoAberto, setPopupSimuladoAberto] = useState(false);

  // Hook para acessar informações da rota atual.
  const location = useLocation();
  // Obtém o usuário logado passado via estado da rota, embora não seja utilizado neste componente.
  const usuario = location.state?.usuario;

  // Efeito para carregar as matérias do arquivo JSON quando o componente é montado.
  useEffect(() => {
    setMaterias(dados.materias);
  }, []);

  // Função para adicionar uma nova matéria à lista.
  const adicionarMateria = (nome) => {
    const nova = {
      id: materias.length + 1, // ID simples baseado no tamanho da lista (pode ser melhorado).
      nome,
      simulados: []
    };
    setMaterias([...materias, nova]);
  };

  // Função para adicionar um novo simulado a uma matéria específica.
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
      {/* Renderiza o cabeçalho da página. */}
      <Header />

      {/* Mapeia a lista de matérias e renderiza um CardMateria para cada uma. */}
      {materias.map((materia) => (
        <CardMateria
          key={materia.id}
          materia={materia}
          // A função para adicionar simulado é passada, mas a lógica de qual matéria está sendo editada precisa ser melhorada.
          onAdicionarSimulado={() => setPopupSimuladoAberto(true)}
        />
      ))}

      {/* Botão flutuante (FAB) para adicionar uma nova matéria. */}
      <button className="fab" onClick={() => setPopupMateriaAberto(true)}>
        +
      </button>

      {/* Renderização condicional dos popups. */}
      {popupMateriaAberto && (
        <PopupMateria
          onClose={() => setPopupMateriaAberto(false)}
          onConfirm={adicionarMateria}
        />
      )}
      {popupSimuladoAberto && (
        <PopupSimulado
          onClose={() => setPopupSimuladoAberto(false)}
          // ATENÇÃO: O ID da matéria (1) está fixo. Isso significa que o simulado sempre será adicionado à primeira matéria.
          onConfirm={(nome, arquivo) => adicionarSimulado(1, nome, arquivo)}
        />
      )}
    </div>
  );
}