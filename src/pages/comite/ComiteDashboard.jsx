import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogOut, ListChecks, FileStack, CopyX, Shuffle, KeyRound, PenLine } from 'lucide-react';

import { getUsuario, cerrarSesion } from '../../utils/auth';
import TabPreguntas from '../../components/gestion-academica/TabPreguntas';
import TabDocentes from '../../components/gestion-academica/TabDocentes';
import TabDuplicados from '../../components/gestion-academica/TabDuplicados';
import TabCartilla from '../../components/gestion-academica/TabCartilla';
import TabGenerarExamen from '../../components/gestion-academica/TabGenerarExamen';

const TABS = [
  { id: 'preguntas', label: 'Validar preguntas', icono: ListChecks },
  { id: 'docentes', label: 'Docentes', icono: FileStack },
  { id: 'duplicados', label: 'Duplicados', icono: CopyX },
  { id: 'generar-examen', label: 'Generar examen', icono: Shuffle },
  { id: 'cartilla', label: 'Cartilla de respuestas', icono: KeyRound },
];

export default function ComiteDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [tabActivo, setTabActivo] = useState('preguntas');

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Panel del Comité
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {usuario?.nombres} · <span className="capitalize text-magenta-300">{usuario?.rol}</span>
            </span>
            <Link
              to="/docente/preguntas"
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <PenLine size={14} /> Subir mis preguntas
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
          {TABS.map((tab) => {
            const Icono = tab.icono;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  tabActivo === tab.id
                    ? 'border-magenta-400 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icono size={14} /> {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {tabActivo === 'preguntas' && <TabPreguntas />}
        {tabActivo === 'docentes' && <TabDocentes />}
        {tabActivo === 'duplicados' && <TabDuplicados />}
        {tabActivo === 'generar-examen' && <TabGenerarExamen />}
        {tabActivo === 'cartilla' && <TabCartilla />}
      </main>
    </div>
  );
}
