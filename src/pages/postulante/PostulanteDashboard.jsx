import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, PenLine, BarChart3, School, ClipboardCheck, ArrowRight, Clock } from 'lucide-react';

import { getUsuario, cerrarSesion } from '../../utils/auth';

const OPCIONES = [
  {
    id: 'simulacro',
    titulo: 'Rendir un simulacro',
    descripcion: 'Practica con preguntas aleatorias, en las mismas condiciones que el examen real.',
    icono: PenLine,
    ruta: '/postulante/simulacro',
    disponible: true,
  },
  {
    id: 'resultados',
    titulo: 'Ver mis evaluaciones',
    descripcion: 'Revisa tus aciertos, errores y tu progreso a lo largo de tus simulacros.',
    icono: BarChart3,
    ruta: '/postulante/resultados',
    disponible: true,
  },
  {
    id: 'carrera',
    titulo: 'Mi carrera',
    descripcion: 'Información de la carrera elegida y tu segunda opción, por si no alcanzas la primera.',
    icono: School,
    ruta: '/postulante/carrera',
    disponible: false,
  },
  {
    id: 'matricula',
    titulo: 'Completar mi registro / matrícula',
    descripcion: 'Pagos pendientes, validación de datos escolares y siguientes pasos para matricularte.',
    icono: ClipboardCheck,
    ruta: '/postulante/matricula',
    disponible: false,
  },
];

export default function PostulanteDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Mi cuenta
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-2xl font-bold text-white">Hola, {usuario?.nombres} 👋</h1>
        <p className="mt-1 text-gray-400">¿Qué quieres hacer hoy?</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {OPCIONES.map((opcion) => {
            const Icono = opcion.icono;
            const contenido = (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                    <Icono size={20} />
                  </span>
                  {!opcion.disponible && (
                    <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-400">
                      <Clock size={11} /> Próximamente
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-white">{opcion.titulo}</h2>
                <p className="mt-1.5 text-sm text-gray-400">{opcion.descripcion}</p>
                {opcion.disponible && (
                  <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-magenta-300">
                    Ir ahora <ArrowRight size={14} />
                  </span>
                )}
              </>
            );

            return opcion.disponible ? (
              <button
                key={opcion.id}
                onClick={() => navigate(opcion.ruta)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-magenta-400/40 hover:bg-white/[0.05]"
              >
                {contenido}
              </button>
            ) : (
              <div key={opcion.id} className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left opacity-60">
                {contenido}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
