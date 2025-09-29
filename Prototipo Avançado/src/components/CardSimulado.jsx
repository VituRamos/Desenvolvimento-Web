// Importa o hook useState do React para gerenciar o estado do componente.
import { useState } from "react";
// Importa o componente CardAluno para exibir os detalhes de cada aluno.
import CardAluno from "./CardAluno";

// Componente para exibir um item de simulado, que pode ser expandido para ver os alunos.
export default function CardSimulado({ simulado }) {
  // Estado para controlar se o item do simulado está aberto (expandido) ou fechado.
  const [aberto, setAberto] = useState(false);

  return (
    <div>
      {/* A área principal do simulado é clicável e alterna o estado 'aberto'. */}
      <div className="simulado" onClick={() => setAberto(!aberto)}>
        {/* Ícone de seta que gira com base no estado 'aberto'. */}
        <span className={`material-icons arrow ${aberto ? "open" : ""}`}>
          chevron_right
        </span>
        {/* Título do simulado. */}
        <span className="titulo-simulado">{simulado.nome}</span>
      </div>
      {/* O conteúdo com os detalhes do simulado só é renderizado se o estado 'aberto' for verdadeiro. */}
      {aberto && (
        <div className="simulado-options active">
          {/* Container para a lista de alunos que participaram do simulado. */}
          <div className="lista-alunos">
            {/* Mapeia a lista de alunos do simulado e renderiza um CardAluno para cada um. */}
            {simulado.alunos.map((aluno) => (
              <CardAluno key={aluno.id} aluno={aluno} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
