// Importa o hook useState para gerenciar o estado de "aberto" do item.
import { useState } from 'react';
// Importa as imagens usadas nas opções do simulado.
import ClipboardTeste from '../assets/ClipboardTeste.png';
import MedalTeste from '../assets/MedalTeste.png';

// Componente que representa um único item de simulado dentro de um card de matéria.
// Recebe um objeto 'simulado' como propriedade.
const SimuladoItem = ({ simulado }) => {
  // Estado para controlar se as opções do simulado estão visíveis.
  const [aberto, setAberto] = useState(false);

  return (
    // Container para o item do simulado.
    <div className="simulado-item">
      {/* Título do simulado, que ao ser clicado, inverte o estado 'aberto'. */}
      <div className="simulado" onClick={() => setAberto(!aberto)}>
        {/* Ícone de seta que muda de direção com base no estado 'aberto'. */}
        <span className={`material-icons arrow bolder ${aberto ? 'open' : ''}`}>
          chevron_right
        </span>
        {/* Exibe o nome do simulado. */}
        <span className="titulo-simulado">{simulado.nome}</span>
      </div>
      {/* Renderiza as opções do simulado somente se o estado 'aberto' for verdadeiro. */}
      {aberto && (
        <div id={simulado.id} className="simulado-options active">
          {/* Opção para realizar o simulado. */}
          <div className="simulado-option-item">
            <img src={ClipboardTeste} alt="clipboard" />
            <div className="simulado-option-text">
              <h4>Realizar simulado</h4>
              <p>Inicie o simulado e respondenda as questões geradas.</p>
            </div>
          </div>
          {/* Opção para ver os resultados. */}
          <div className="simulado-option-item">
            <img src={MedalTeste} alt="medal" />
            <div className="simulado-option-text">
              <h4>Resultados do simulado</h4>
              <p>
                Saiba dos resultados obtidos do simulado e pontos que você pode
                melhorar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimuladoItem;