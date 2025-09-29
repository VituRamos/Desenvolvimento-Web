import GoogleIcon from "../assets/google-icon.png";
import LeBudda from "../assets/LeBudda.png";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PopupCadastro from "./PopupCadastro";
import usuariosData from "../data/usuarios.json";
import DashboardAluno from "./DashboardAluno";
import DashboardProfessor from "./DashboardProfessor";

// Componente funcional para a tela de Login.
const Login = () => {
    // Estado para controlar a visibilidade do popup de cadastro.
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    // Estado para armazenar a lista de alunos, inicializada com dados de um arquivo JSON.
    const [alunos, setAlunos] = useState(usuariosData.alunos || []);
    // Estado para armazenar a lista de professores, inicializada com dados de um arquivo JSON.
    const [professores, setProfessores] = useState(usuariosData.professores || []);
    // Estado para o campo de email do formulário.
    const [email, setEmail] = useState("");
    // Estado para o campo de senha do formulário.
    const [senha, setSenha] = useState("");
    // Estado para guardar as informações do usuário que fez login (seja aluno ou professor).
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    // Função para abrir o popup de cadastro.
    const openPopup = () => {
        setIsPopupOpen(true);
    };

    // Função para lidar com o cadastro de um novo usuário (aluno ou professor).
    const handleCadastro = (usuario, tipo) => {
        // Gera um ID único para o novo usuário.
        const novoUsuario = { ...usuario, id: uuidv4() };
        if (tipo === "aluno") {
            // Adiciona o novo aluno à lista de alunos.
            setAlunos([...alunos, novoUsuario]);
        } else {
            // Adiciona o novo professor à lista de professores.
            setProfessores([...professores, novoUsuario]);
        }
    };

    // Função para lidar com a submissão do formulário de login.
    const handleLogin = (e) => {
        e.preventDefault(); // Previne o recarregamento da página.

        // Procura o usuário na lista de alunos.
        const alunoEncontrado = alunos.find(
            (aluno) => aluno.email === email && aluno.senha === senha
        );

        // Procura o usuário na lista de professores.
        const professorEncontrado = professores.find(
            (prof) => prof.email === email && prof.senha === senha
        );

        if (alunoEncontrado) {
            // Se for aluno, atualiza o estado do usuário logado com os dados e o tipo.
            setUsuarioLogado({ ...alunoEncontrado, tipo: "aluno" });
        } else if (professorEncontrado) {
            // Se for professor, atualiza o estado do usuário logado.
            setUsuarioLogado({ ...professorEncontrado, tipo: "professor" });
        } else {
            // Se não encontrar, exibe um alerta.
            alert("Email ou senha inválidos!");
        }
    };

    // Se um usuário já estiver logado, renderiza o dashboard correspondente.
    if (usuarioLogado) {
        if (usuarioLogado.tipo === "aluno") {
            return <DashboardAluno usuario={usuarioLogado} />;
        } else {
            return <DashboardProfessor usuario={usuarioLogado} />;
        }
    }

    // Se não houver usuário logado, renderiza a tela de login.
    return (
        <main className="login-container">
            <div className="login-box">
                <div className="login-form-area">
                    <div className="login-header">
                        <h2>BEM VINDO DE VOLTA!</h2>
                        <p>Por favor, insira seu email e senha.</p>
                    </div>

                    {/* Formulário de login */}
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn primary-btn">
                            Entrar
                        </button>
                    </form>

                    {/* Link para abrir o popup de cadastro */}
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <a href="#" onClick={openPopup}>
                            Não tem conta? Cadastre-se aqui.
                        </a>
                    </div>
                </div>

                {/* Área da imagem de ilustração */}
                <div className="login-image-area">
                    <img src={LeBudda} alt="LeBudda" />
                </div>
            </div>

            {/* Renderiza o popup de cadastro se isPopupOpen for true */}
            {isPopupOpen && (
                <PopupCadastro
                    onClose={() => setIsPopupOpen(false)} // Passa a função para fechar o popup.
                    onConfirm={handleCadastro} // Passa a função para confirmar o cadastro.
                />
            )}
        </main>
    );
};

export default Login;