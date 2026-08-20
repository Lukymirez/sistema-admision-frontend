import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import api from '../../services/api';
import { MATERIAS, EstadoError } from './shared';

/**
 * Detección de posibles preguntas repetidas entre distintos docentes.
 * Usado por Administrador y Comité.
 */
export default function TabDuplicados() {
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
