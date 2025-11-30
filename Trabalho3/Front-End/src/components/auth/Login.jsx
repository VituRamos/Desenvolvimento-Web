// --- Bloco de Importação ---
import GoogleIcon from "../../assets/google-icon.png";
import LeBudda from "../../assets/LeBudda.png";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PopupCadastro from "./PopupCadastro";
import { useGoogleLogin } from '@react-oauth/google';
import apiRequest from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL;

// --- Componente Login ---
const Login = () => {
    // --- Estados do Componente ---
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    
    // --- Hooks ---
    const navigate = useNavigate();

    // --- Funções de Manipulação de Eventos ---
    const openPopup = () => setIsPopupOpen(true);

    const fetchUserAndRedirect = async () => {
        try {
            const userData = await apiRequest("/users/me");
            localStorage.setItem('userId', userData.id);
            localStorage.setItem('userType', userData.tipo);
            localStorage.setItem('userName', userData.nome);
            
            if (userData.tipo === "aluno") {
                navigate("/aluno");
            } else if (userData.tipo === "professor") {
                navigate("/professor");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            alert("Não foi possível carregar os dados do usuário. Por favor, tente fazer login novamente.");
            localStorage.removeItem('authToken'); // Limpa token inválido
        }
    };

    // --- Lógica de Login com Google ---
    const handleGoogleLoginSuccess = async (tokenResponse) => {
        try {
            const tokenData = await apiRequest('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ code: tokenResponse.code }),
            });
            
            localStorage.setItem('authToken', tokenData.access_token);
            await fetchUserAndRedirect();

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

    // --- Lógica de Login com Email/Senha ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', senha);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha no login');
            }

            const tokenData = await response.json();
            localStorage.setItem('authToken', tokenData.access_token);
            await fetchUserAndRedirect();

        } catch (error) {
            console.error("Erro no login:", error);
            alert(error.message);
        }
    };

    // --- Lógica de Cadastro ---
    const handleCadastro = async (usuario, tipo) => {
        const novoUsuario = { ...usuario, tipo };
        try {
            await apiRequest('/usuarios', {
                method: 'POST',
                body: JSON.stringify(novoUsuario),
            });
            
            alert("Cadastro realizado com sucesso! Por favor, faça o login.");
            setIsPopupOpen(false);

        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert(`Não foi possível cadastrar: ${error.message}`);
        }
    };

    // --- Renderização do Componente ---
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
