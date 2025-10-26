import FeedbackItem from "./FeedbackItem";

export default function FeedbackCard({ titulo, itens }) {
  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <h3>{titulo}</h3>
      </div>
      <div className="feedback-body">
        {itens.map((item, index) => (
          <FeedbackItem key={index} titulo={item.titulo} texto={item.texto} />
        ))}
      </div>
    </div>
  );
}
