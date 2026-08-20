import { useEffect, useState } from 'react';

import api from '../../services/api';
import { EstadoCargando, EstadoError } from './shared';

/**
 * Progreso de subida de preguntas por docente, por materia y estado.
 * Usado por Administrador y Comité.
 */
export default function TabDocentes() {
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
