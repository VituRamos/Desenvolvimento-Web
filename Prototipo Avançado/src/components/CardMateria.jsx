import { useState } from "react";
import CardSimulado from "./CardSimulado";
import AlunosGrid from "./AlunosGrid";

  const alunosDaMateria = [
    { id: 1, nome: "João" },
    { id: 2, nome: "Maria" },
    { id: 3, nome: "Pedro" },
  ];

export default function CardMateria({ materia, onAdicionarSimulado }) {
  const [aberto, setAberto] = useState(false);

  const onAdicionarAluno = () => {
    console.log("Adicionar novo aluno à matéria:", materia.nome);
  };

  return (
    <div className="card">
      <div className="card-header" onClick={() => setAberto(!aberto)}>
        {materia.nome}
        <span className={`material-icons arrow ${aberto ? "open" : ""}`}>
          chevron_right
        </span>
      </div>
      {aberto && (
        <div className="card-content active">
          {materia.simulados.map((s) => (
            <CardSimulado key={s.id} simulado={s} />
          ))}
          <button className="btn" onClick={onAdicionarSimulado}>
            Adicionar novo simulado
          </button>
          <AlunosGrid alunos={alunosDaMateria} onAdicionarAluno={onAdicionarAluno} />
        </div>
      )}
    </div>
  );
}