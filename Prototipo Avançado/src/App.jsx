import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DashboardAluno from "./components/DashboardAluno";
import DashboardProfessor from "./components/DashboardProfessor";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota inicial -> Login */}
        <Route path="/" element={<Login />} />

        {/* Rota para aluno */}
        <Route path="/aluno" element={<DashboardAluno />} />

        {/* Rota para professor */}
        <Route path="/professor" element={<DashboardProfessor />} />
      </Routes>
    </Router>
  );
}

export default App;
