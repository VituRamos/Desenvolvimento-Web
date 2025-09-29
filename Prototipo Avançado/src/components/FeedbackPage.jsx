import Header from "./Header";
import AlunoInfo from "./AlunoInfo";
import FeedbackCard from "./FeedbackCard";
import Actions from "./Actions";
import "../index.css";

export default function FeedbackPage() {
  const feedback = {
    titulo: "Feedback do Simulado de Português",
    itens: [
      {
        titulo: "Pontos Fortes",
        texto: "O aluno demonstrou bom conhecimento em gramática e interpretação de texto."
      },
      {
        titulo: "Pontos a Melhorar",
        texto: "O aluno precisa focar mais em figuras de linguagem e literatura."
      },
      {
        titulo: "Sugestões",
        texto: "Recomendamos a leitura de 'Dom Casmurro' e a revisão dos exercícios sobre metáforas."
      }
    ]
  };

  return (
    <div className="container">
      <Header />
      <div className="feedback-container">
        <AlunoInfo nome="Nome do Aluno" id="12345" />
        <FeedbackCard titulo={feedback.titulo} itens={feedback.itens} />
        <Actions onVoltar={() => window.history.back()} />
      </div>
    </div>
  );
}
