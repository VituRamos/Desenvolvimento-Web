import Avatar from "../assets/Avatar.png";

export default function AlunosGrid({ alunos, onAdicionarAluno }) {
  return (
    <div className="grid alunos">
      <div className="user-icons">
        {alunos.map((aluno) => (
          <img key={aluno.id} src={Avatar} className="avatar aluno" alt={`Avatar de ${aluno.nome}`} />
        ))}
        <button className="adicionar aluno" type="button" aria-label="Adicionar aluno" onClick={onAdicionarAluno}>+</button>
      </div>
    </div>
  );
}