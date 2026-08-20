import { useState } from 'react';
import { Shuffle, Printer, CheckCircle2 } from 'lucide-react';

import api from '../../services/api';
import { MATERIAS, EstadoError } from './shared';

const ETIQUETAS = {
  matematica: 'Matemática',
  razonamiento: 'Razonamiento',
  comunicacion: 'Comunicación',
  historia: 'Historia',
  cultura: 'Cultura General',
  geografia: 'Geografía',
  ciencias: 'Ciencias',
};

/**
 * El Comité arma el examen: elige cuántas preguntas quiere por materia, y el
 * sistema sortea aleatoriamente del pool combinado de todos los docentes
 * (solo preguntas ya validadas). Solo el Comité puede generar el examen —
 * el resultado incluye la respuesta correcta, porque la necesitan para
 * imprimir la cartilla el día de la prueba.
 */
export default function TabGenerarExamen() {
  const [cantidades, setCantidades] = useState(
    MATERIAS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {})
  );
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [examen, setExamen] = useState(null);

  const totalSolicitado = Object.values(cantidades).reduce((sum, n) => sum + Number(n || 0), 0);

  const generar = async () => {
    setError('');
    if (totalSolicitado === 0) {
      setError('Indica al menos una pregunta en alguna materia.');
      return;
    }
    setGenerando(true);
    setExamen(null);
    try {
      const cantidadPorMateria = Object.fromEntries(
        Object.entries(cantidades).filter(([, n]) => Number(n) > 0)
      );
      const res = await api.post('/preguntas/generar-examen', { cantidadPorMateria });
      setExamen(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo generar el examen.');
    } finally {
      setGenerando(false);
    }
  };

  const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-display text-base font-semibold text-white">Cantidad de preguntas por materia</h3>
        <p className="mt-1 text-sm text-gray-400">
          Se sortean al azar del banco combinado de todos los docentes — solo preguntas ya validadas.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MATERIAS.map((m) => (
            <label key={m} className="block">
              <span className="mb-1 block text-xs text-gray-400">{ETIQUETAS[m]}</span>
              <input
                type="number"
                min={0}
                value={cantidades[m]}
                onChange={(e) => setCantidades({ ...cantidades, [m]: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
              />
            </label>
          ))}
        </div>

        {error && (
          <div className="mt-4">
            <EstadoError mensaje={error} />
          </div>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={generar}
            disabled={generando}
            className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Shuffle size={16} />
            {generando ? 'Generando…' : `Generar examen (${totalSolicitado} preguntas)`}
          </button>
          {examen && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <Printer size={14} /> Imprimir
            </button>
          )}
        </div>
      </div>

      {examen && (
        <div className="space-y-4">
          <p className="flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 size={16} /> {examen.mensaje}
          </p>
          {examen.examen.map((pregunta, index) => (
            <div key={pregunta._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-200">
                  <span className="font-display font-semibold text-white">{index + 1}. </span>
                  {pregunta.enunciado}
                </p>
                <span className="shrink-0 rounded-full bg-magenta-600/15 px-2.5 py-1 text-xs font-medium capitalize text-magenta-300">
                  {pregunta.materia}
                </span>
              </div>

              {pregunta.imagenUrl && (
                <img src={`${urlBackend}${pregunta.imagenUrl}`} alt="" className="mt-3 max-h-40 rounded border border-white/10" />
              )}

              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {pregunta.alternativas.map((alt, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      i === pregunta.respuestaCorrecta
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {alt}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">Autor: {pregunta.autorId?.nombres} {pregunta.autorId?.apellidos}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
