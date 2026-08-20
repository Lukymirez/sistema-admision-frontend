import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ArrowLeft, School, Users, CheckCircle2, Loader2, Info } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

export default function MiCarrera() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [datos, setDatos] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [segundaOpcionSeleccionada, setSegundaOpcionSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([api.get('/auth/mi-carrera'), api.get('/carreras')])
      .then(([resMiCarrera, resCarreras]) => {
        setDatos(resMiCarrera.data);
        setCarreras(resCarreras.data?.carreras || []);
        setSegundaOpcionSeleccionada(resMiCarrera.data?.segundaOpcion?._id || '');
      })
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar tu información de carrera.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const guardarSegundaOpcion = async () => {
    if (!segundaOpcionSeleccionada) return;
    setGuardando(true);
    setError('');
    setExito('');
    try {
      const res = await api.put('/auth/mi-carrera', { segundaOpcionCarreraId: segundaOpcionSeleccionada });
      setDatos((prev) => ({ ...prev, segundaOpcion: res.data.segundaOpcion }));
      setExito('Tu segunda opción se guardó correctamente.');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar tu segunda opción.');
    } finally {
      setGuardando(false);
    }
  };

  const carrerasParaSegundaOpcion = carreras.filter((c) => c._id !== datos?.primeraOpcion?._id);

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/postulante" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Mi carrera
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{usuario?.nombres}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/postulante" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
          <ArrowLeft size={14} /> Volver a mi cuenta
        </Link>

        {cargando ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Cargando…
          </div>
        ) : error && !datos ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        ) : (
          <>
            {/* Primera opción */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-magenta-400">
                <CheckCircle2 size={14} /> Primera opción
              </div>
              <h2 className="mt-2 font-display text-xl font-bold text-white">
                {datos?.primeraOpcion?.nombre || 'No definida'}
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-magenta-400" /> {datos?.primeraOpcion?.vacantes ?? '—'} vacantes
                </span>
                <span className="flex items-center gap-1.5 capitalize">
                  <School size={14} className="text-magenta-400" /> Turno {datos?.turno || '—'}
                </span>
                <span className="capitalize">Modalidad: {datos?.modalidadIngreso || '—'}</span>
                <span>Sede: {datos?.sede || '—'}</span>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-ink-900/50 p-3 text-xs text-gray-500">
                <Info size={14} className="mt-0.5 shrink-0" />
                Duración de la carrera: 3 años (6 semestres académicos). Instituto Superior Tecnológico
                Público María Rosario Araoz Pinto — San Miguel, Lima.
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Para cambiar tu primera opción, comunícate con el área administrativa del instituto.
              </p>
            </section>

            {/* Segunda opción */}
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-display text-lg font-semibold text-white">Segunda opción</h2>
              <p className="mt-1 text-sm text-gray-400">
                Si tu promedio del examen no alcanza para ingresar a tu primera opción, puedes ser
                considerado para esta carrera en su lugar. Elige y guarda cuando quieras — puedes
                cambiarla las veces que necesites antes del examen.
              </p>

              {datos?.segundaOpcion && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2 size={16} />
                  Actualmente definida: <strong>{datos.segundaOpcion.nombre}</strong>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
              )}
              {exito && (
                <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">{exito}</div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <select
                  value={segundaOpcionSeleccionada}
                  onChange={(e) => setSegundaOpcionSeleccionada(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
                >
                  <option value="" disabled>
                    Selecciona una carrera
                  </option>
                  {carrerasParaSegundaOpcion.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre} ({c.vacantes} vacantes)
                    </option>
                  ))}
                </select>
                <button
                  onClick={guardarSegundaOpcion}
                  disabled={guardando || !segundaOpcionSeleccionada}
                  className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar segunda opción'}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
