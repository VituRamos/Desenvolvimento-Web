import { useState } from 'react';
import SimuladoItem from '../simulado/SimuladoItem';

// 🔄 ATUALIZADO: Receber prop resultados
const MateriaCard = ({ materia, resultados }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="card">
      <div className="card-header" onClick={() => setAberto(!aberto)}>
        {materia.nome}
        <span className={`material-icons arrow ${aberto ? 'open' : ''}`}>
          chevron_right
        </span>
      </div>
      
      {aberto && (
        <div id={materia.id} className="card-content active">
          <div className="grid simulados">
            {/* 🔄 ATUALIZADO: Passar resultado para cada simulado */}
            {materia.simulados.map((simulado) => (
              <SimuladoItem 
                key={simulado.id} 
                simulado={simulado} 
                resultado={resultados[simulado.id]} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriaCard;
