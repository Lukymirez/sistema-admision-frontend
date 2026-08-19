import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  UserPlus,
  MailCheck,
  Wallet,
  PenLine,
  Award,
} from 'lucide-react';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../services/api';

// Carreras de respaldo — se muestran si la API todavía no tiene datos cargados
// o el backend no está disponible en este momento. Reemplazar/complementar
// con lo que devuelva GET /api/carreras en producción.
const CARRERAS_RESPALDO = [
  { _id: 'demo-1', nombre: 'Administración de Empresas', vacantes: 40 },
  { _id: 'demo-2', nombre: 'Contabilidad', vacantes: 40 },
  { _id: 'demo-3', nombre: 'Construcción Civil', vacantes: 30 },
  { _id: 'demo-4', nombre: 'Desarrollo de Sistemas de Información', vacantes: 40 },
  { _id: 'demo-5', nombre: 'Diseño Gráfico', vacantes: 30 },
  { _id: 'demo-6', nombre: 'Diseño Publicitario', vacantes: 30 },
  { _id: 'demo-7', nombre: 'Secretariado Ejecutivo', vacantes: 30 },
  { _id: 'demo-8', nombre: 'Mecánica Automotriz', vacantes: 30 },
  { _id: 'demo-9', nombre: 'Mecánica de Producción', vacantes: 30 },
];

const PROCESO = [
  { icono: UserPlus, titulo: 'Regístrate', detalle: 'Completa tus datos personales y académicos en el formulario de postulación.' },
  { icono: MailCheck, titulo: 'Verifica tu correo', detalle: 'Confirma tu cuenta con el enlace que te enviamos por correo electrónico.' },
  { icono: Wallet, titulo: 'Paga tu inscripción', detalle: 'Registra tu voucher de pago para habilitar tu postulación.' },
  { icono: PenLine, titulo: 'Rinde el examen', detalle: 'Preséntate en la fecha y modalidad asignadas a tu proceso de admisión.' },
  { icono: Award, titulo: 'Consulta resultados', detalle: 'Revisa tu puntaje y el cuadro de méritos apenas se publiquen.' },
];

export default function Home() {
  const [carreras, setCarreras] = useState(CARRERAS_RESPALDO);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);

  useEffect(() => {
    let activo = true;
    api
      .get('/carreras')
      .then((res) => {
        if (activo && Array.isArray(res.data?.carreras) && res.data.carreras.length > 0) {
          setCarreras(res.data.carreras);
        }
      })
      .catch(() => {
        // Si el backend no responde, se mantienen las carreras de respaldo.
      })
      .finally(() => {
        if (activo) setCargandoCarreras(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <Header />

      {/* ---------- HERO ---------- */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-magenta-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
          <div>
            <span className="inline-flex items-center rounded-full border border-magenta-400/30 bg-magenta-600/10 px-4 py-1.5 font-sans text-xs font-medium text-magenta-300">
              Proceso de Admisión 2026-II
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Tu carrera empieza con un{' '}
              <span className="bg-gradient-to-r from-magenta-400 to-indigo-500 bg-clip-text text-transparent">
                buen examen
              </span>
            </h1>
            <p className="mt-6 max-w-lg font-sans text-lg text-gray-400">
              Postula en línea, verifica tu cuenta por correo y sigue todo tu proceso de admisión
              desde un solo lugar: inscripción, pago, examen y resultados.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-sans text-sm font-semibold text-white shadow-lg shadow-magenta-600/25 transition hover:opacity-90"
              >
                Registrarme como postulante
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-sans text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Panel lateral con datos clave del proceso, a modo de "ficha" */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-magenta-300">
              Fechas clave
            </p>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <dt className="font-sans text-sm text-gray-400">Inicio de inscripciones</dt>
                <dd className="font-display text-sm font-semibold text-white">01 ago 2026</dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <dt className="font-sans text-sm text-gray-400">Cierre de inscripciones</dt>
                <dd className="font-display text-sm font-semibold text-white">15 sep 2026</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-sans text-sm text-gray-400">Fecha de examen</dt>
                <dd className="font-display text-sm font-semibold text-white">20 sep 2026</dd>
              </div>
            </dl>
            <p className="mt-4 font-sans text-xs text-gray-500">
              * Fechas de ejemplo — se actualizan automáticamente cuando la convocatoria esté
              publicada.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- CARRERAS (estilo "boleto de admisión") ---------- */}
      <section id="carreras" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="font-sans text-sm font-semibold uppercase tracking-widest text-magenta-400">Carreras</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Elige la carrera a la que vas a postular
          </h2>
          <p className="mt-3 font-sans text-gray-400">
            Cada carrera es tu boleto de entrada al proceso. Revisa las vacantes disponibles antes
            de completar tu registro.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {carreras.map((carrera, index) => (
            <div
              key={carrera._id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-magenta-400/40 hover:bg-white/[0.05]"
            >
              {/* Muescas laterales tipo boleto */}
              <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />
              <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <span className="font-display text-xs font-semibold text-gray-500">
                    N° {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="rounded-full bg-magenta-600/15 px-3 py-1 font-sans text-xs font-medium text-magenta-300">
                    {carrera.vacantes ?? '—'} vacantes
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{carrera.nombre}</h3>

                <div className="my-5 border-t border-dashed border-white/15" />

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-magenta-300 transition group-hover:text-magenta-200"
                >
                  Postular a esta carrera
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        {cargandoCarreras && (
          <p className="mt-6 font-sans text-xs text-gray-500">Cargando carreras disponibles…</p>
        )}
      </section>

      {/* ---------- SOBRE EL INSTITUTO ---------- */}
      <section id="nosotros" className="border-y border-white/10 bg-ink-900/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="mt-2 font-sans text-sm font-semibold uppercase tracking-widest text-magenta-400">
              Sobre el instituto
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Formación técnica con salida laboral real
            </h2>
            <p className="mt-4 font-sans leading-relaxed text-gray-400">
              El Instituto Superior Tecnológico Público María Rosario Araoz Pinto, ubicado en el
              distrito de San Miguel, Lima, forma profesionales técnicos en 9 carreras a lo largo
              de 3 años (6 semestres académicos), con turno diurno y turno nocturno.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div>
                <p className="font-display text-2xl font-bold text-white">9</p>
                <p className="font-sans text-xs text-gray-500">carreras técnicas</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white">3</p>
                <p className="font-sans text-xs text-gray-500">años de estudio</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white">2</p>
                <p className="font-sans text-xs text-gray-500">turnos: diurno y nocturno</p>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-2xl border border-white/10 bg-gradient-to-br from-magenta-600/20 to-indigo-600/20" />
        </div>
      </section>

      {/* ---------- PROCESO DE ADMISIÓN (pasos numerados: sí es una secuencia real) ---------- */}
      <section id="proceso" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="font-sans text-sm font-semibold uppercase tracking-widest text-magenta-400">Cómo postular</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Cinco pasos, un solo lugar
          </h2>
        </div>

        <ol className="grid gap-8 md:grid-cols-5">
          {PROCESO.map((paso, index) => {
            const Icono = paso.icono;
            return (
              <li key={paso.titulo} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-magenta-400/30 bg-magenta-600/10 text-magenta-300">
                  <Icono size={20} />
                </div>
                <p className="mt-4 font-display text-xs font-semibold text-gray-500">
                  Paso {index + 1}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-white">{paso.titulo}</h3>
                <p className="mt-2 font-sans text-sm text-gray-400">{paso.detalle}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- CONTACTO Y UBICACIÓN ---------- */}
      <section className="border-t border-white/10 bg-ink-900/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-2">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-widest text-magenta-400">
              Contacto y ubicación
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              ¿Tienes dudas sobre tu postulación?
            </h2>
            <p className="mt-4 font-sans text-gray-400">
              Escríbenos o acércate a nuestras instalaciones en San Miguel, Lima. La dirección
              exacta, teléfono y horario de esta sección son de ejemplo — reemplázalos con los
              datos reales de contacto del instituto.
            </p>

            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-magenta-400" />
                <span className="font-sans text-sm text-gray-300">
                  Distrito de San Miguel, Lima, Perú
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-magenta-400" />
                <span className="font-sans text-sm text-gray-300">+51 900 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-magenta-400" />
                <span className="font-sans text-sm text-gray-300">admision@instituto.edu.pe</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-magenta-400" />
                <span className="font-sans text-sm text-gray-300">Lun. a vie., 8:00 a.m. – 5:00 p.m.</span>
              </li>
            </ul>
          </div>

          {/* Placeholder de mapa — reemplazar el src por el iframe real de Google Maps del instituto */}
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-center">
            <MapPin size={28} className="text-gray-600" />
            <p className="font-sans text-sm text-gray-500">
              Aquí va el mapa de ubicación real
              <br />
              (inserta el iframe de Google Maps de tu instituto)
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
