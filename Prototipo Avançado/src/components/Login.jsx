import GoogleIcon from "../assets/google-icon.png";
import LeBudda from "../assets/LeBudda.png";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PopupCadastro from "./PopupCadastro";
import usuariosData from "../data/usuarios.json"; 
import DashboardAluno from "./DashboardAluno";
import DashboardProfessor from "./DashboardProfessor";

const Login = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [alunos, setAlunos] = useState(usuariosData.alunos || []);
    const [professores, setProfessores] = useState(usuariosData.professores || []);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [usuarioLogado, setUsuarioLogado] = useState(null); // guarda o usuário logado + tipo

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const handleCadastro = (usuario, tipo) => {
        const novoUsuario = { ...usuario, id: uuidv4() };
        if (tipo === "aluno") {
            setAlunos([...alunos, novoUsuario]);
        } else {
            setProfessores([...professores, novoUsuario]);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        const alunoEncontrado = alunos.find(
            (aluno) => aluno.email === email && aluno.senha === senha
        );

        const professorEncontrado = professores.find(
            (prof) => prof.email === email && prof.senha === senha
        );

        if (alunoEncontrado) {
            setUsuarioLogado({ ...alunoEncontrado, tipo: "aluno" });
        } else if (professorEncontrado) {
            setUsuarioLogado({ ...professorEncontrado, tipo: "professor" });
        } else {
            alert("Email ou senha inválidos!");
        }
    };

    // Se usuário já fez login, renderiza painel correspondente
    if (usuarioLogado) {
        if (usuarioLogado.tipo === "aluno") {
            return <DashboardAluno usuario={usuarioLogado} />;
        } else {
            return <DashboardProfessor usuario={usuarioLogado} />;
        }
    }

    // Tela de login
    return (
        <main className="login-container">
            <div className="login-box">
                <div className="login-form-area">
                    <div className="login-header">
                        <h2>BEM VINDO DE VOLTA!</h2>
                        <p>Por favor, insira seu email e senha.</p>
                    </div>

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

                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <a href="#" onClick={openPopup}>
                            Não tem conta? Cadastre-se aqui.
                        </a>
                    </div>
                </div>

                <div className="login-image-area">
                    <img src={LeBudda} alt="LeBudda" />
                </div>
            </div>

            {isPopupOpen && (
                <PopupCadastro
                    onClose={() => setIsPopupOpen(false)}
                    onConfirm={handleCadastro}
                />
            )}
        </main>
    );
};

export default Login;
