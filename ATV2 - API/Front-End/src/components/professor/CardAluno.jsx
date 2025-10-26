// Importa a imagem padrão do avatar.
import Avatar from "../../assets/Avatar.png";

// Componente para exibir um card com as informações de um aluno.
export default function CardAluno({ aluno }) {
  return (
    // Container principal do card do aluno.
    <div className="card-aluno">
      {/* Seção do avatar do aluno. */}
      <div className="avatar aluno">
        <img src={Avatar} className="avatar aluno" alt="aluno" />
      </div>
      {/* Seção com as informações de texto (nome e ID). */}
      <div className="info">
        <div className="nome">{aluno.nome}</div>
        <div className="id">{aluno.id}</div>
      </div>
      {/* Seção que exibe a pontuação do aluno. */}
      <div className="pontuacao">
        <span>Pontuação</span>
        <strong>{aluno.pontuacao}</strong>
      </div>
    </div>
  );
}
