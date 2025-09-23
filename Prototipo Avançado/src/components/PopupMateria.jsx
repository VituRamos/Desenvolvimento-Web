import { useState } from "react";

export default function PopupMateria({ onClose, onConfirm }) {
  const [nome, setNome] = useState("");

  const handleConfirm = () => {
    if (nome.trim()) {
      onConfirm(nome);
      setNome("");
      onClose();
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Adicionar nova matéria</h2>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="popup-input"
          placeholder="Digite o nome da matéria"
        />
        <div className="popup-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
