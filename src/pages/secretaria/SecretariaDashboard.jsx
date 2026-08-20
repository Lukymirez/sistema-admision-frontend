import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';

import { getUsuario, cerrarSesion } from '../../utils/auth';
import TabPostulantesCompleto from '../../components/gestion-postulantes/TabPostulantesCompleto';

/**
 * Secretaría Académica: seguimiento de postulantes, con acceso a todos sus
 * datos (incluido correo y teléfono, para contactarlos si necesitan
 * regularizar algún documento) y descarga de reportes con filtros.
 * Comparte exactamente la misma pantalla y los mismos permisos de backend
 * que la pestaña "Postulantes" del Administrador.
 */
export default function SecretariaDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

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
            Secretaría Académica — Seguimiento de postulantes
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {usuario?.nombres} · <span className="capitalize text-magenta-300">{usuario?.rol}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <TabPostulantesCompleto />
      </main>
    </div>
  );
}
