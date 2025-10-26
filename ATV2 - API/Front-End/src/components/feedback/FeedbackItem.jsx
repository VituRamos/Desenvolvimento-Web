export default function FeedbackItem({ titulo, texto }) {
  return (
    <div className="feedback-item">
      <h4>{titulo}</h4>
      <p>{texto}</p>
    </div>
  );
}
