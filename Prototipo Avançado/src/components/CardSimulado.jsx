import { useState } from "react";
import CardAluno from "./CardAluno";

export default function CardSimulado({ simulado }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div>
      <div className="simulado" onClick={() => setAberto(!aberto)}>
        <span className={`material-icons arrow ${aberto ? "open" : ""}`}>
          chevron_right
        </span>
        <span className="titulo-simulado">{simulado.nome}</span>
      </div>
      {aberto && (
        <div className="simulado-options active">
          <div className="lista-alunos">
            {simulado.alunos.map((aluno) => (
              <CardAluno key={aluno.id} aluno={aluno} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}