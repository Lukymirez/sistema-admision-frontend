import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Plus, CheckCircle2, Clock, XCircle, ImagePlus, X } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

const MATERIAS = [
  { value: 'matematica', label: 'Matemática' },
  { value: 'razonamiento', label: 'Razonamiento' },
  { value: 'comunicacion', label: 'Comunicación' },
  { value: 'historia', label: 'Historia' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'geografia', label: 'Geografía' },
  { value: 'ciencias', label: 'Ciencias' },
];

// Meta orientativa de preguntas por materia — ajustable según lo que
// finalmente acuerde el Comité (ej. 20 preguntas por materia por docente).
const META_POR_MATERIA = 20;

const PREGUNTA_VACIA = { materia: 'matematica', enunciado: '', alternativas: ['', '', '', ''], respuestaCorrecta: 0, imagenUrl: '' };

const ESTADO_BADGE = {
  borrador: { icono: Clock, texto: 'En revisión', clase: 'bg-amber-500/15 text-amber-300' },
  validada: { icono: CheckCircle2, texto: 'Validada', clase: 'bg-emerald-500/15 text-emerald-300' },
  rechazada: { icono: XCircle, texto: 'Rechazada', clase: 'bg-red-500/15 text-red-300' },
};

export default function BancoPreguntas() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [form, setForm] = useState(PREGUNTA_VACIA);
  const [preguntas, setPreguntas] = useState([]);
  const [progreso, setProgreso] = useState({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);

  const cargarMisPreguntas = () => {
    setCargandoLista(true);
    api
      .get('/preguntas/mias')
      .then((res) => {
        setPreguntas(res.data?.preguntas || []);
        setProgreso(res.data?.progresoPorMateria || {});
      })
      .catch(() => setError('No se pudieron cargar tus preguntas. Intenta recargar la página.'))
      .finally(() => setCargandoLista(false));
  };

  useEffect(() => {
    cargarMisPreguntas();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const actualizarAlternativa = (index, valor) => {
    const nuevas = [...form.alternativas];
    nuevas[index] = valor;
    setForm({ ...form, alternativas: nuevas });
  };

  const handleSeleccionarImagen = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError('');
    setSubiendoImagen(true);
    try {
      const datosFormulario = new FormData();
      datosFormulario.append('imagen', archivo);
      const res = await api.post('/uploads/imagen', datosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imagenUrl: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const quitarImagen = () => setForm((prev) => ({ ...prev, imagenUrl: '' }));

  // La URL de la imagen la sirve el backend (ej: /uploads/preguntas/xxx.png);
  // hay que anteponerle el host del backend para poder previsualizarla aquí.
  const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  const urlCompletaImagen = form.imagenUrl ? `${urlBackend}${form.imagenUrl}` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (form.alternativas.some((alt) => !alt.trim())) {
      setError('Completa las 4 alternativas.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/preguntas', form);
      setExito('Pregunta registrada como borrador — quedará pendiente de validación del Comité.');
      setForm({ ...PREGUNTA_VACIA, materia: form.materia }); // conserva la materia seleccionada para agilizar la carga
      cargarMisPreguntas();
    } catch (err) {
      const mensajeApi = err.response?.data?.mensaje || err.response?.data?.errores?.[0]?.msg;
      setError(mensajeApi || 'Ocurrió un error al registrar la pregunta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Banco de preguntas
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
        {/* Progreso por materia */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-semibold text-white">Tu progreso de subida</h2>
          <p className="mt-1 text-sm text-gray-400">
            Meta orientativa: {META_POR_MATERIA} preguntas por materia. Las preguntas validadas por el Comité
            entran al sorteo aleatorio del examen.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {MATERIAS.map((materia) => {
              const cantidad = progreso[materia.value] || 0;
              const porcentaje = Math.min(100, Math.round((cantidad / META_POR_MATERIA) * 100));
              return (
                <div key={materia.value} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-400">{materia.label}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-white">
                    {cantidad}/{META_POR_MATERIA}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-brand-gradient" style={{ width: `${porcentaje}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulario para subir una pregunta */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Agregar pregunta</h2>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
            )}
            {exito && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                {exito}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-300">Materia</span>
                <select
                  value={form.materia}
                  onChange={(e) => setForm({ ...form, materia: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
                >
                  {MATERIAS.map((materia) => (
                    <option key={materia.value} value={materia.value}>
                      {materia.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-300">Enunciado</span>
                <textarea
                  required
                  rows={3}
                  value={form.enunciado}
                  onChange={(e) => setForm({ ...form, enunciado: e.target.value })}
                  placeholder="Escribe la pregunta completa..."
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-magenta-400"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-300">
                  Imagen de apoyo (opcional — para diagramas, gráficos o fórmulas)
                </span>
                {urlCompletaImagen ? (
                  <div className="relative inline-block">
                    <img
                      src={urlCompletaImagen}
                      alt="Vista previa de la imagen de la pregunta"
                      className="max-h-40 rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={quitarImagen}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                      aria-label="Quitar imagen"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-ink-900 py-4 text-sm text-gray-400 transition hover:border-magenta-400 hover:text-gray-200">
                    <ImagePlus size={18} />
                    {subiendoImagen ? 'Subiendo...' : 'Haz clic para subir una imagen (PNG, JPG, WEBP · máx. 5MB)'}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleSeleccionarImagen}
                      disabled={subiendoImagen}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-300">
                  Alternativas (marca el círculo de la respuesta correcta)
                </span>
                <div className="space-y-2">
                  {form.alternativas.map((alt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="respuestaCorrecta"
                        checked={form.respuestaCorrecta === index}
                        onChange={() => setForm({ ...form, respuestaCorrecta: index })}
                        className="h-4 w-4 shrink-0 accent-magenta-500"
                      />
                      <input
                        required
                        value={alt}
                        onChange={(e) => actualizarAlternativa(index, e.target.value)}
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-magenta-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Plus size={16} />
                {loading ? 'Guardando...' : 'Agregar pregunta'}
              </button>
            </form>
          </section>

          {/* Lista de mis preguntas */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Mis preguntas subidas</h2>
            {cargandoLista ? (
              <p className="mt-4 text-sm text-gray-500">Cargando…</p>
            ) : preguntas.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Todavía no has subido ninguna pregunta.</p>
            ) : (
              <ul className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {preguntas.map((pregunta) => {
                  const badge = ESTADO_BADGE[pregunta.estado];
                  const Icono = badge.icono;
                  return (
                    <li key={pregunta._id} className="rounded-lg border border-white/10 bg-ink-900/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-200">{pregunta.enunciado}</p>
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs ${badge.clase}`}>
                          <Icono size={12} /> {badge.texto}
                        </span>
                      </div>
                      {pregunta.imagenUrl && (
                        <img
                          src={`${(api.defaults.baseURL || '').replace(/\/api\/?$/, '')}${pregunta.imagenUrl}`}
                          alt=""
                          className="mt-2 max-h-24 rounded border border-white/10"
                        />
                      )}
                      <p className="mt-1 text-xs capitalize text-gray-500">{pregunta.materia}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
