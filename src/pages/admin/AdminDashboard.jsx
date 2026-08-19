import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Users,
  FileStack,
  CopyX,
  KeyRound,
  Loader2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

const MATERIAS = ['matematica', 'razonamiento', 'comunicacion', 'historia', 'cultura', 'geografia', 'ciencias'];

const TABS = [
  { id: 'postulantes', label: 'Postulantes', icono: Users },
  { id: 'docentes', label: 'Docentes', icono: FileStack },
  { id: 'duplicados', label: 'Duplicados', icono: CopyX },
  { id: 'cartilla', label: 'Cartilla de respuestas', icono: KeyRound },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [tabActivo, setTabActivo] = useState('postulantes');

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
            Panel administrativo
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
        {tabActivo === 'postulantes' && <TabPostulantes />}
        {tabActivo === 'docentes' && <TabDocentes />}
        {tabActivo === 'duplicados' && <TabDuplicados />}
        {tabActivo === 'cartilla' && <TabCartilla />}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Postulantes: flujo por carrera y turno                                  */
/* ---------------------------------------------------------------------- */
function TabPostulantes() {
  const [postulantes, setPostulantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/auth/postulantes')
      .then((res) => setPostulantes(res.data?.postulantes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar la lista de postulantes.'))
      .finally(() => setCargando(false));
  }, []);

  const porCarrera = postulantes.reduce((acc, p) => {
    const nombreCarrera = p.carreraId?.nombre || 'Sin carrera';
    acc[nombreCarrera] = (acc[nombreCarrera] || 0) + 1;
    return acc;
  }, {});

  const porTurno = postulantes.reduce((acc, p) => {
    const turno = p.turno || 'Sin turno';
    acc[turno] = (acc[turno] || 0) + 1;
    return acc;
  }, {});

  if (cargando) return <EstadoCargando />;
  if (error) return <EstadoError mensaje={error} />;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <ResumenTarjeta titulo="Postulantes por carrera" datos={porCarrera} />
        <ResumenTarjeta titulo="Postulantes por turno" datos={porTurno} capitalizar />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Carrera</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">Modalidad</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {postulantes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Todavía no hay postulantes registrados.
                </td>
              </tr>
            ) : (
              postulantes.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">{p.nombres} {p.apellidos}</td>
                  <td className="px-4 py-3 text-gray-400">{p.dni}</td>
                  <td className="px-4 py-3">{p.carreraId?.nombre || '—'}</td>
                  <td className="px-4 py-3 capitalize">{p.turno || '—'}</td>
                  <td className="px-4 py-3 capitalize">{p.modalidadIngreso || '—'}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge activo={p.estado === 'activo'} texto={p.estado} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Docentes: progreso de subida por materia                                */
/* ---------------------------------------------------------------------- */
function TabDocentes() {
  const [progreso, setProgreso] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/preguntas/progreso-docentes')
      .then((res) => setProgreso(res.data?.progreso || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar el progreso de los docentes.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <EstadoCargando />;
  if (error) return <EstadoError mensaje={error} />;

  if (progreso.length === 0) {
    return <p className="text-sm text-gray-500">Todavía ningún docente ha subido preguntas.</p>;
  }

  return (
    <div className="space-y-4">
      {progreso.map((docente) => (
        <div key={docente.autorId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-white">
                {docente.nombres} {docente.apellidos}
              </p>
              <p className="text-xs capitalize text-gray-500">{docente.email} · {docente.rol}</p>
            </div>
            <span className="rounded-full bg-magenta-600/15 px-3 py-1 text-xs font-medium text-magenta-300">
              {docente.total} preguntas subidas
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {docente.detalle.map((d, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                  d.estado === 'validada'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : d.estado === 'rechazada'
                      ? 'bg-red-500/15 text-red-300'
                      : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {d.materia}: {d.cantidad} ({d.estado})
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Duplicados: posibles preguntas repetidas entre docentes distintos       */
/* ---------------------------------------------------------------------- */
function TabDuplicados() {
  const [materia, setMateria] = useState('');
  const [duplicados, setDuplicados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  const buscar = () => {
    setCargando(true);
    setError('');
    setBuscado(true);
    api
      .get('/preguntas/duplicados', { params: materia ? { materia } : {} })
      .then((res) => setDuplicados(res.data?.posiblesDuplicados || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo ejecutar la búsqueda de duplicados.'))
      .finally(() => setCargando(false));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-300">Materia (opcional, recomendado)</span>
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
          >
            <option value="">Todas las materias</option>
            {MATERIAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={buscar}
          disabled={cargando}
          className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {cargando ? 'Buscando…' : 'Buscar posibles duplicados'}
        </button>
      </div>

      {error && <EstadoError mensaje={error} />}

      {!cargando && buscado && duplicados.length === 0 && !error && (
        <p className="text-sm text-emerald-300">No se encontraron preguntas similares entre distintos docentes. ✅</p>
      )}

      <div className="space-y-4">
        {duplicados.map((par, i) => (
          <div key={i} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-300">
              <AlertTriangle size={16} /> {par.similitud}% de similitud
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">{par.preguntaA.autor?.nombres} {par.preguntaA.autor?.apellidos}</p>
                <p className="mt-1 text-sm text-gray-200">{par.preguntaA.enunciado}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{par.preguntaB.autor?.nombres} {par.preguntaB.autor?.apellidos}</p>
                <p className="mt-1 text-sm text-gray-200">{par.preguntaB.enunciado}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Cartilla de respuestas: restringida hasta después del examen            */
/* ---------------------------------------------------------------------- */
function TabCartilla() {
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaId, setConvocatoriaId] = useState('');
  const [preguntas, setPreguntas] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api
      .get('/convocatorias')
      .then((res) => {
        const lista = res.data?.convocatorias || [];
        setConvocatorias(lista);
        if (lista[0]) setConvocatoriaId(lista[0]._id);
      })
      .catch(() => setConvocatorias([]));
  }, []);

  const consultar = () => {
    if (!convocatoriaId) return;
    setCargando(true);
    setError('');
    setPreguntas(null);
    api
      .get(`/preguntas/cartilla/${convocatoriaId}`)
      .then((res) => setPreguntas(res.data?.preguntas || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo obtener la cartilla.'))
      .finally(() => setCargando(false));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-300">Convocatoria</span>
          <select
            value={convocatoriaId}
            onChange={(e) => setConvocatoriaId(e.target.value)}
            className="min-w-[240px] rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
          >
            {convocatorias.length === 0 && <option value="">No hay convocatorias cargadas</option>}
            {convocatorias.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={consultar}
          disabled={cargando || !convocatoriaId}
          className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {cargando ? 'Consultando…' : 'Ver cartilla de respuestas'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <Lock size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preguntas && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Pregunta</th>
                <th className="px-4 py-3">Respuesta correcta</th>
                <th className="px-4 py-3">Autor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {preguntas.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 capitalize">{p.materia}</td>
                  <td className="px-4 py-3">{p.enunciado}</td>
                  <td className="px-4 py-3 font-medium text-emerald-300">
                    {p.alternativas[p.respuestaCorrecta]}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {p.autorId?.nombres} {p.autorId?.apellidos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Helpers visuales compartidos                                           */
/* ---------------------------------------------------------------------- */
function ResumenTarjeta({ titulo, datos, capitalizar }) {
  const entradas = Object.entries(datos);
  const total = entradas.reduce((sum, [, cantidad]) => sum + cantidad, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-sm font-semibold text-white">{titulo}</h3>
      <div className="mt-4 space-y-3">
        {entradas.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos todavía.</p>
        ) : (
          entradas.map(([etiqueta, cantidad]) => (
            <div key={etiqueta}>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className={capitalizar ? 'capitalize' : ''}>{etiqueta}</span>
                <span>{cantidad}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-brand-gradient"
                  style={{ width: `${total === 0 ? 0 : Math.round((cantidad / total) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ activo, texto }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
        activo ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
      }`}
    >
      {texto}
    </span>
  );
}

function EstadoCargando() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Loader2 size={16} className="animate-spin" /> Cargando…
    </div>
  );
}

function EstadoError({ mensaje }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <span>{mensaje}</span>
    </div>
  );
}
