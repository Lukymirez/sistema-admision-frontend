import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';

import api from '../../services/api';
import { MATERIAS, EstadoBadge, EstadoCargando, EstadoError } from './shared';

/**
 * Ver TODAS las preguntas del banco y validarlas una por una.
 * Usado por el panel de Administrador y el panel del Comité (mismo backend,
 * ambos roles tienen permiso en GET /preguntas y PUT /preguntas/:id/validar
 * — la validación en sí, por reglas de negocio, la ejecuta el Comité).
 */
export default function TabPreguntas() {
  const [preguntas, setPreguntas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('borrador');
  const [filtroMateria, setFiltroMateria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  const cargar = () => {
    setCargando(true);
    setError('');
    const params = {};
    if (filtroEstado) params.estado = filtroEstado;
    if (filtroMateria) params.materia = filtroMateria;
    api
      .get('/preguntas', { params })
      .then((res) => setPreguntas(res.data?.preguntas || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudieron cargar las preguntas.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroMateria]);

  const cambiarEstado = async (id, nuevoEstado) => {
    setProcesandoId(id);
    try {
      await api.put(`/preguntas/${id}/validar`, { estado: nuevoEstado });
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo actualizar la pregunta.');
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-300">Estado</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
          >
            <option value="borrador">Pendientes de revisión</option>
            <option value="validada">Validadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="">Todas</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-300">Materia</span>
          <select
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
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
      </div>

      {error && <EstadoError mensaje={error} />}
      {cargando ? (
        <EstadoCargando />
      ) : preguntas.length === 0 ? (
        <p className="text-sm text-gray-500">No hay preguntas con este filtro.</p>
      ) : (
        <div className="space-y-4">
          {preguntas.map((pregunta) => (
            <div key={pregunta._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-magenta-600/15 px-2.5 py-1 text-xs font-medium capitalize text-magenta-300">
                    {pregunta.materia}
                  </span>
                  <p className="mt-2 text-sm text-gray-200">{pregunta.enunciado}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Por {pregunta.autorId?.nombres} {pregunta.autorId?.apellidos} ({pregunta.autorId?.email})
                  </p>
                </div>
                <EstadoBadge activo={pregunta.estado === 'validada'} texto={pregunta.estado} />
              </div>

              {pregunta.imagenUrl && (
                <img
                  src={`${(api.defaults.baseURL || '').replace(/\/api\/?$/, '')}${pregunta.imagenUrl}`}
                  alt=""
                  className="mt-3 max-h-40 rounded border border-white/10"
                />
              )}

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {pregunta.alternativas.map((alt, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      index === pregunta.respuestaCorrecta
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {alt}
                    {index === pregunta.respuestaCorrecta && <CheckCircle2 size={14} className="ml-auto shrink-0" />}
                  </li>
                ))}
              </ul>

              {pregunta.estado !== 'validada' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => cambiarEstado(pregunta._id, 'validada')}
                    disabled={procesandoId === pregunta._id}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Validar
                  </button>
                  <button
                    onClick={() => cambiarEstado(pregunta._id, 'rechazada')}
                    disabled={procesandoId === pregunta._id}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              )}
              {pregunta.estado === 'validada' && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
                  <Lock size={12} /> Ya validada — entra al sorteo de simulacros y del examen.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
