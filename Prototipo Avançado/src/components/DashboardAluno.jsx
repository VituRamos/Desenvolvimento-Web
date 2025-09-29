import { useLocation } from 'react-router-dom';
import Header from './Header';
import MateriaCard from './MateriaCard';

// Mock data for now, this would come from an API or props
const materias = [
  {
    id: 'portugues',
    nome: 'Português',
    simulados: [
      { id: 's1', nome: 'Simulado 1' },
      { id: 's2', nome: 'Simulado 2' },
      { id: 's3', nome: 'Simulado 3' },
    ],
  },
  // Add other materias here
];

export default function DashboardAluno() {
  const location = useLocation();
  const usuario = location.state?.usuario;

  return (
    <div className="container">
      <Header />
      {materias.map((materia) => (
        <MateriaCard key={materia.id} materia={materia} />
      ))}
    </div>
  );
}
