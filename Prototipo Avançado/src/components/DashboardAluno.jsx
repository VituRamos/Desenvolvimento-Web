import { useLocation } from "react-router-dom";

export default function DashboardAluno() {
  const location = useLocation();
  const usuario = location.state?.usuario;

  return (
    <div className="container">
      <h2>Bem-vindo(a), {usuario?.email} 👨‍🎓</h2>
      <p>Você está logado como <strong>ALUNO</strong>.</p>

      {/* Aqui você pode listar simulados, notas, etc. */}
      <p>Em breve: área exclusiva para alunos.</p>
    </div>
  );
}
