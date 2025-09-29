// Importa o hook useLocation do react-router-dom para acessar dados da rota.
import { useLocation } from "react-router-dom";

// Componente para o painel do aluno.
export default function DashboardAluno() {
  // O hook useLocation permite acessar o objeto de localização da URL atual.
  const location = useLocation();
  // Obtém os dados do usuário passados através do estado da rota ao fazer o login.
  const usuario = location.state?.usuario;

  return (
    <div className="container">
      {/* Exibe uma mensagem de boas-vindas com o email do usuário. */}
      <h2>Bem-vindo(a), {usuario?.email} 👨‍🎓</h2>
      <p>Você está logado como <strong>ALUNO</strong>.</p>

      {/* Placeholder para futuras funcionalidades do dashboard do aluno. */}
      <p>Em breve: área exclusiva para alunos.</p>
    </div>
  );
}