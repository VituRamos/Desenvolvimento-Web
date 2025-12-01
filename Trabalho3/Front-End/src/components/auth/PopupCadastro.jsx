// Importa o React e o hook useState para gerenciar o estado do formulário.
import React, { useState } from "react";

// Componente para o popup de cadastro de novos usuários.
export default function PopupCadastro({ onClose, onConfirm }) {
  // Estados para armazenar os dados dos campos do formulário.
  const [identificador, setIdentificador] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("aluno"); // O tipo padrão é 'aluno'.

  // Função chamada ao clicar no botão de confirmação.
  const handleConfirm = () => {
    // Validação simples para garantir que os campos não estão vazios.
    if (identificador.trim() && nome.trim() && email.trim() && senha.trim()) {
      // Cria um novo objeto de usuário com os dados do formulário.
      const novoUsuario = {
        id: identificador, // Envia o RA ou RP como 'id'
        nome: nome,
        email: email,
        senha: senha, // a senha deve ser criptografada para uma aplicação real.
      };

      // Chama a função onConfirm (passada via props) com o novo usuário e seu tipo.
      onConfirm(novoUsuario, tipo);

      // Limpa os campos do formulário após o cadastro bem-sucedido.
      setIdentificador("");
      setNome("");
      setEmail("");
      setSenha("");
      // Fecha o popup.
      onClose();
    } else {
      // Alerta o usuário se algum campo estiver em branco.
      alert("Por favor, preencha todos os campos.");
    }
  };

  const identificadorLabel = tipo === 'aluno' ? 'RA' : 'RP'; // Rótulo simplificado
  const identificadorPlaceholder = tipo === 'aluno' ? 'Digite seu RA' : 'Digite seu RP';

  return (
    
    // O overlay escurece o fundo da página.
    <div className="popup-overlay">
      {/* O conteúdo do popup. */}
      <div className="popup-content">
        {/* Botão para fechar o popup. */}
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Cadastrar novo usuário</h2>
        
        {/* Campo de seleção para o tipo de usuário. */}
        <div className="input-group">
          <label htmlFor="tipo">Tipo de usuário:</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="popup-input"> {/* Adicionado className */}
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>
        </div>

        {/* Campo de entrada para o Identificador (RA ou RP). */}
        <div className="input-group">
          <label htmlFor="identificador">{identificadorLabel}:</label>
          <input
            type="text"
            id="identificador"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            className="popup-input"
            placeholder={identificadorPlaceholder}
          />
        </div>



        {/* Campo de entrada para o nome. */}
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

        {/* Campo de entrada para o email. */}
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

        {/* Campo de entrada para a senha. */}
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

        {/* Botões de ação do popup. */}
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
