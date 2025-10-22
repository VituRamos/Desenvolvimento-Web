// Importa os hooks 'useEffect' e 'useState' do React, embora não estejam sendo utilizados neste arquivo.
import { useEffect, useState } from "react";
// Importa os componentes necessários do 'react-router-dom' para configurar o roteamento da aplicação.
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importa os componentes das páginas que serão renderizadas pelas rotas.
import Login from "./components/Login";
import DashboardAluno from "./components/DashboardAluno";
import DashboardProfessor from "./components/DashboardProfessor";
import Simulado from "./components/Simulado";
import FeedbackPage from "./components/FeedbackPage";

// Componente principal da aplicação, responsável por gerenciar as rotas.
function App() {
  return (
    // 'Router' (como BrowserRouter) é o componente que envolve a aplicação e habilita o roteamento.
    <Router>
      {/* 'Routes' é o componente que agrupa as definições de rota. */}
      <Routes>
        {/* Define a rota raiz ("/") para renderizar o componente de Login. */}
        <Route path="/" element={<Login />} />

        {/* Define a rota "/aluno" para renderizar o dashboard do aluno. */}
        <Route path="/aluno" element={<DashboardAluno />} />

        {/* Define a rota "/professor" para renderizar o dashboard do professor. */}
        <Route path="/professor" element={<DashboardProfessor />} />

        {/* Define a rota "/simulado" para renderizar o dashboard do professor. */}
        <Route path="/simulado/:simuladoId" element={<Simulado />} />

        {/* Define a rota "/feedback" para renderizar o dashboard do professor. */}
        <Route path="/feedback/:simuladoId" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

// Exporta o componente App para ser utilizado em outras partes da aplicação (como no main.jsx).
export default App;