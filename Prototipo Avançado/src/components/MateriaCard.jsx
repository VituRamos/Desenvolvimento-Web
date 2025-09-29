// Importa o hook useState para gerenciar o estado de "aberto" do card.
import { useState } from 'react';
// Importa o componente filho para renderizar cada item de simulado.
import SimuladoItem from './SimuladoItem';

// Componente que representa o card de uma matéria.
// Recebe um objeto 'materia' como propriedade.
const MateriaCard = ({ materia }) => {
  // Estado para controlar se o conteúdo do card está visível ou não.
  const [aberto, setAberto] = useState(false);

  return (
    // Estrutura principal do card.
    <div className="card">
      {/* Cabeçalho do card, que ao ser clicado, inverte o estado 'aberto'. */}
      <div className="card-header" onClick={() => setAberto(!aberto)}>
        {/* Exibe o nome da matéria. */}
        {materia.nome}
        {/* Ícone de seta que muda de direção com base no estado 'aberto'. */}
        <span className={`material-icons arrow ${aberto ? 'open' : ''}`}>
          chevron_right
        </span>
      </div>
      {/* Renderiza o conteúdo do card somente se o estado 'aberto' for verdadeiro. */}
      {aberto && (
        <div id={materia.id} className="card-content active">
          <div className="grid simulados">
            {/* Mapeia a lista de simulados da matéria para renderizar um componente SimuladoItem para cada um. */}
            {materia.simulados.map((simulado) => (
              <SimuladoItem key={simulado.id} simulado={simulado} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MateriaCard;