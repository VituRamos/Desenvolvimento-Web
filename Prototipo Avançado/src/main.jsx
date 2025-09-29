// Importa a biblioteca principal do React.
import React from "react";
// Importa o ReactDOM, que fornece métodos específicos do DOM para o React.
import ReactDOM from "react-dom/client";
// Importa o componente principal da aplicação, o 'App'.
import App from "./App";
// Importa a folha de estilos global da aplicação.
import "./index.css";

// Cria a raiz da aplicação React no elemento com o id 'root' do arquivo index.html.
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode é um wrapper que verifica potenciais problemas na aplicação durante o desenvolvimento.
  <React.StrictMode>
    {/* Renderiza o componente principal 'App' dentro do StrictMode. */}
    <App />
  </React.StrictMode>
);