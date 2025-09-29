import { useState } from 'react';
import ClipboardTeste from '../assets/ClipboardTeste.png';
import MedalTeste from '../assets/MedalTeste.png';

const SimuladoItem = ({ simulado }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="simulado-item">
      <div className="simulado" onClick={() => setAberto(!aberto)}>
        <span className={`material-icons arrow bolder ${aberto ? 'open' : ''}`}>
          chevron_right
        </span>
        <span className="titulo-simulado">{simulado.nome}</span>
      </div>
      {aberto && (
        <div id={simulado.id} className="simulado-options active">
          <div className="simulado-option-item">
            <img src={ClipboardTeste} alt="clipboard" />
            <div className="simulado-option-text">
              <h4>Realizar simulado</h4>
              <p>Inicie o simulado e respondenda as questões geradas.</p>
            </div>
          </div>
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
