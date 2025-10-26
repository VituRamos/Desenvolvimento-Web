// src/components/Login.jsx

import GoogleIcon from "../../assets/google-icon.png";
import LeBudda from "../../assets/LeBudda.png";
// Adiciona a importação de useEffect e useNavigate
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PopupCadastro from "./PopupCadastro";
// Importação para o login com Google
import { useGoogleLogin } from '@react-oauth/google';

// Componente funcional para a tela de Login.
const Login = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    // Instancia o hook de navegação para podermos redirecionar o usuário.
    const navigate = useNavigate();

    // --- EFEITO PARA REDIRECIONAMENTO ---
    // Este useEffect será executado sempre que o estado 'usuarioLogado' mudar.
    useEffect(() => {
        // Se o usuárioLogado não for nulo (ou seja, o login foi bem-sucedido)
        if (usuarioLogado) {
            // Verifica o tipo de usuário e navega para a rota correspondente.
            if (usuarioLogado.tipo === "aluno") {
                navigate("/aluno");
            } else if (usuarioLogado.tipo === "professor") {
                navigate("/professor");
            }
        }
    }, [usuarioLogado, navigate]); // As dependências do hook

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    // --- LÓGICA DE LOGIN COM GOOGLE ---
    const handleGoogleLoginSuccess = async (tokenResponse) => {
        const code = tokenResponse.code;
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha no login com Google');
            }

            const usuario = await response.json();
            // Salva o tipo no localStorage ANTES de definir o estado para o useEffect poder redirecionar.
            localStorage.setItem('userType', usuario.tipo);
            setUsuarioLogado(usuario); // Atualiza o estado, o que vai disparar o useEffect.

        } catch (error) {
            console.error("Erro no login com Google:", error);
            alert(`Não foi possível fazer login com o Google: ${error.message}`);
        }
    };

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: handleGoogleLoginSuccess,
        onError: (error) => {
            console.error('Login com Google falhou:', error);
            alert('Ocorreu um erro durante o login com Google.');
        }
    });

    // --- LÓGICA DE LOGIN COM EMAIL/SENHA ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, senha: senha }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha no login');
            }

            const usuario = await response.json();
            // Salva o tipo no localStorage e atualiza o estado para disparar o redirecionamento.
            localStorage.setItem('userType', usuario.tipo);
            setUsuarioLogado(usuario);

        } catch (error) {
            console.error("Erro no login:", error);
            alert(error.message);
        }
    };

    // --- LÓGICA DE CADASTRO ---
    const handleCadastro = async (usuario, tipo) => {
        const novoUsuario = { ...usuario, tipo: tipo };
        try {
            const response = await fetch('http://127.0.0.1:8000/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoUsuario),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao cadastrar usuário');
            }

            const usuarioCriado = await response.json();
            console.log("Usuário cadastrado com sucesso:", usuarioCriado);
            alert("Cadastro realizado com sucesso! Por favor, faça o login.");
            setIsPopupOpen(false); // Fecha o popup após o sucesso

        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert(`Não foi possível cadastrar: ${error.message}`);
        }
    };

    // O componente agora SEMPRE renderiza a tela de login.
    // O redirecionamento é feito pelo useEffect.
    return (
        <div className="login-page-wrapper">
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

                        <div className="divider">ou</div>

                        <button
                            type="button"
                            className="btn google-btn"
                            onClick={() => googleLogin()}
                        >
                            <img src={GoogleIcon} alt="Google logo" />
                            Entrar com Google
                        </button>

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
        </div>
    );
};

export default Login;
