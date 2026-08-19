import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

/**
 * Pie de página público.
 * NOTA: los datos de contacto/dirección son placeholder — reemplazar por los
 * datos reales del instituto antes de publicar (nombre, dirección, teléfono, correo).
 */
export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer id="contacto" className="border-t border-white/10 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                <GraduationCap size={20} className="text-white" />
              </span>
              <span>Admisión 2026</span>
            </div>
            <p className="mt-4 font-sans text-sm leading-relaxed text-gray-400">
              Instituto Superior Tecnológico Público María Rosario Araoz Pinto — proceso de
              admisión 2026. San Miguel, Lima, Perú.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Facebook" className="text-gray-400 transition hover:text-magenta-400">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 transition hover:text-magenta-400">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-400 transition hover:text-magenta-400">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-200">Enlaces</h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-gray-400">
              <li>
                <a href="#inicio" className="hover:text-white">Inicio</a>
              </li>
              <li>
                <a href="#carreras" className="hover:text-white">Carreras</a>
              </li>
              <li>
                <a href="#proceso" className="hover:text-white">Proceso de admisión</a>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">Registro de postulante</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">Iniciar sesión</Link>
              </li>
            </ul>
          </div>

          {/* Carreras (placeholder — se puede alimentar desde la API más adelante) */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-200">Carreras</h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-gray-400">
              <li>Administración de Empresas</li>
              <li>Contabilidad</li>
              <li>Desarrollo de Sistemas de Información</li>
              <li>
                <a href="#carreras" className="text-magenta-400 hover:text-magenta-300">Ver las 9 carreras →</a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-200">Contacto</h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-magenta-400" />
                <span>San Miguel, Lima, Perú — dirección exacta pendiente de confirmar</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-magenta-400" />
                <span>+51 900 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-magenta-400" />
                <span>admision@instituto.edu.pe</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 font-sans text-xs text-gray-500 md:flex-row">
          <p>© {anioActual} Instituto de Educación Superior. Todos los derechos reservados.</p>
          <p>Sistema de Admisión — Proyecto académico</p>
        </div>
      </div>
    </footer>
  );
}
