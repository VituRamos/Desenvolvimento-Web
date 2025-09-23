import { useState } from "react";

export default function PopupSimulado({ onClose, onConfirm }) {
  const [nome, setNome] = useState("");
  const [arquivo, setArquivo] = useState(null);

  const handleConfirm = () => {
    if (!nome.trim() || !arquivo) return;
    onConfirm(nome, arquivo);
    setNome("");
    setArquivo(null);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Adicionar novo simulado</h2>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="popup-input"
          placeholder="Digite o nome do simulado"
        />

        <label className="popup-label">Carregar arquivo:</label>
        <input
          type="file"
          onChange={(e) => setArquivo(e.target.files[0])}
          className="popup-input-file"
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
