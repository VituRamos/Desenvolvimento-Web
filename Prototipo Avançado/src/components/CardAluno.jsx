import Avatar from "../assets/Avatar.png"

export default function CardAluno({ aluno }) {
  return (
    <div className="card-aluno">
      <div className="avatar aluno">
        <img src={Avatar} className="avatar aluno" alt="aluno" />
      </div>
      <div className="info">
        <div className="nome">{aluno.nome}</div>
        <div className="id">{aluno.id}</div>
      </div>
      <div className="pontuacao">
        <span>Pontuação</span>
        <strong>{aluno.pontuacao}</strong>
      </div>
    </div>
  );
}
