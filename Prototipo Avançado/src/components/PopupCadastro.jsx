import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function PopupCadastro({ onClose, onConfirm }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("aluno"); // "aluno" ou "professor"

  const handleConfirm = () => {
    // Validação básica dos campos
    if (nome.trim() && email.trim() && senha.trim()) {
      const novoUsuario = {
        id: uuidv4(), // Gera um ID único
        nome: nome,
        email: email,
        senha: senha,
      };

      // Chama a função onConfirm, passando o novo usuário e o tipo
      onConfirm(novoUsuario, tipo);

      // Limpa os campos após o cadastro
      setNome("");
      setEmail("");
      setSenha("");
      onClose();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Cadastrar novo usuário</h2>

        <div className="input-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="popup-input"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="popup-input"
            placeholder="Digite seu email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="popup-input"
            placeholder="Digite sua senha"
          />
        </div>

        <div className="input-group">
          <label htmlFor="tipo">Tipo de usuário:</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>
        </div>

        <div className="popup-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}