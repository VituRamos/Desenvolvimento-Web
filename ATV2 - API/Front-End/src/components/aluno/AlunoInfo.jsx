import Avatar from "../../assets/Avatar.png";

export default function AlunoInfo({ nome, id }) {
  return (
    <div className="aluno-info">
      <img src={Avatar} alt="Avatar do Aluno" className="aluno-avatar" />
      <div className="aluno-dados">
        <h2>{nome}</h2>
        <p>ID: {id}</p>
      </div>
    </div>
  );
}
