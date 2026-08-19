import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';

const ENLACES = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Carreras', href: '#carreras' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Contacto', href: '#contacto' },
];

/**
 * Cabecera pública del sitio. Se usa en el Home y otras páginas públicas.
 * Los enlaces de navegación apuntan a las secciones del Home (anclas #).
 */
export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const irAInicio = (href) => {
    setMenuAbierto(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      // pequeño delay para permitir que el Home monte antes de saltar al ancla
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
            <GraduationCap size={20} className="text-white" />
          </span>
          <span>
            Admisión <span className="text-magenta-400">2026</span>
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-8 md:flex">
          {ENLACES.map((enlace) => (
            <button
              key={enlace.href}
              onClick={() => irAInicio(enlace.href)}
              className="font-sans text-sm text-gray-300 transition hover:text-white"
            >
              {enlace.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 font-sans text-sm font-medium text-gray-200 transition hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-gradient px-5 py-2 font-sans text-sm font-semibold text-white shadow-lg shadow-magenta-600/20 transition hover:opacity-90"
          >
            Postular ahora
          </Link>
        </div>

        {/* Botón menú móvil */}
        <button
          className="text-white md:hidden"
          onClick={() => setMenuAbierto((prev) => !prev)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="border-t border-white/10 bg-ink-950 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {ENLACES.map((enlace) => (
              <button
                key={enlace.href}
                onClick={() => irAInicio(enlace.href)}
                className="text-left font-sans text-sm text-gray-300"
              >
                {enlace.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
              <Link to="/login" onClick={() => setMenuAbierto(false)} className="font-sans text-sm text-gray-200">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuAbierto(false)}
                className="rounded-full bg-brand-gradient px-5 py-2 text-center font-sans text-sm font-semibold text-white"
              >
                Postular ahora
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
