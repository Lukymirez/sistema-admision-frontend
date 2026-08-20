import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

import api from '../../services/api';

/**
 * Cartilla de respuestas de una convocatoria.
 * Usado por Administrador (restringido hasta después de la fecha del
 * examen, validado por el backend) y Comité (sin restricción, la necesita
 * para imprimir el examen).
 */
export default function TabCartilla() {
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
