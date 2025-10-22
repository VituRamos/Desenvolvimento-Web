// src/components/Login.jsx

import GoogleIcon from "../assets/google-icon.png";
import LeBudda from "../assets/LeBudda.png";
// Certifique-se de que a importação do useState está aqui
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PopupCadastro from "./PopupCadastro";
// Mantenha a importação dos dados mockados para cadastro inicial, se necessário
import usuariosData from "../data/usuarios.json";
import DashboardAluno from "./DashboardAluno";
import DashboardProfessor from "./DashboardProfessor";
// Importação para o login com Google
import { useGoogleLogin } from '@react-oauth/google';

// Componente funcional para a tela de Login.
const Login = () => {
    // Estado para controlar a visibilidade do popup de cadastro.
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    // Estado para armazenar a lista de alunos (pode ser inicializada vazia se o cadastro for só via API)
    const [alunos, setAlunos] = useState(usuariosData.alunos || []);
    // Estado para armazenar a lista de professores (pode ser inicializada vazia)
    const [professores, setProfessores] = useState(usuariosData.professores || []);
    // Estado para o campo de email do formulário.
    const [email, setEmail] = useState("");
    // Estado para o campo de senha do formulário.
    const [senha, setSenha] = useState("");
    // Estado para guardar as informações do usuário que fez login.
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    // --- DEFINIÇÃO DA FUNÇÃO openPopup ---
    // Função para abrir o popup de cadastro.
    const openPopup = () => {
        setIsPopupOpen(true);
    };
    // ------------------------------------

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
                 const errorData = await response.json(); // Tenta pegar mais detalhes do erro
                 throw new Error(errorData.detail || 'Falha no login com Google');
            }

            const usuario = await response.json();
            // Salva o tipo no localStorage ANTES de definir o estado
            localStorage.setItem('userType', usuario.tipo);
            setUsuarioLogado(usuario); // Redireciona

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

    // --- LÓGICA DE LOGIN COM EMAIL/SENHA (AGORA COM API) ---
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
                 const errorData = await response.json(); // Tenta pegar mais detalhes do erro
                 throw new Error(errorData.detail || 'Falha no login');
            }

            const usuario = await response.json();
            // Salva o tipo no localStorage ANTES de definir o estado
            localStorage.setItem('userType', usuario.tipo);
            setUsuarioLogado(usuario); // Redireciona

        } catch (error) {
             console.error("Erro no login:", error);
             alert(error.message); // Mostra o erro específico da API
        }
    };

    // --- LÓGICA DE CADASTRO (AGORA COM API) ---
    const handleCadastro = async (usuario, tipo) => {
         const novoUsuario = { ...usuario, tipo: tipo }; // Adiciona o tipo ao objeto
        try {
             const response = await fetch('http://127.0.0.1:8000/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoUsuario),
            });

            if (!response.ok) {
                 const errorData = await response.json(); // Tenta pegar mais detalhes do erro
                 throw new Error(errorData.detail || 'Falha ao cadastrar usuário');
            }

             const usuarioCriado = await response.json();
             console.log("Usuário cadastrado com sucesso:", usuarioCriado);
             // Opcional: Atualizar a lista local se precisar (mas não é mais usado para login)
             if (tipo === 'aluno') {
                setAlunos([...alunos, usuarioCriado]);
             } else {
                setProfessores([...professores, usuarioCriado]);
             }
             // Fecha o popup implicitamente (já feito dentro do PopupCadastro)

        } catch (error) {
             console.error("Erro no cadastro:", error);
             alert(`Não foi possível cadastrar: ${error.message}`);
        }
    };


    // Se um usuário já estiver logado, renderiza o dashboard correspondente.
    if (usuarioLogado) {
        if (usuarioLogado.tipo === "aluno") {
            // Passa o usuário como estado para o dashboard poder usar, se necessário
            return <DashboardAluno usuario={usuarioLogado} />;
        } else {
            return <DashboardProfessor usuario={usuarioLogado} />;
        }
    }

    // Se não houver usuário logado, renderiza a tela de login.
    return (
        <div className="login-page-wrapper">
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

                        <div className="divider">ou</div>

                        {/* Botão do Google atualizado */}
                        <button
                            type="button"
                            className="btn google-btn"
                            onClick={() => googleLogin()} // Chama a função do hook
                        >
                            <img src={GoogleIcon} alt="Google logo" />
                            Entrar com Google
                        </button>


                        {/* Link para abrir o popup de cadastro */}
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            {/* Garante que onClick chama a função definida */}
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
                        onConfirm={handleCadastro} // Passa a função para confirmar o cadastro (agora chama a API).
                    />
                )}
            </main>
        </div>
    );
};

export default Login;