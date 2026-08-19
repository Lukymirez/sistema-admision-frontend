import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

export default function Resultados() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/simulacro/mis-resultados')
      .then((res) => setResultados(res.data?.resultados || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudieron cargar tus resultados.'))
      .finally(() => setCargando(false));
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const promedioPorcentaje = resultados.length
    ? Math.round(resultados.reduce((sum, r) => sum + r.porcentaje, 0) / resultados.length)
    : 0;

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/postulante" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Mis evaluaciones
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

        <h1 className="font-display text-2xl font-bold text-white">Tu progreso</h1>
        <p className="mt-1 text-sm text-gray-500">
          Solo se muestran tus aciertos, errores y porcentaje — las respuestas correctas del banco
          de preguntas se mantienen confidenciales.
        </p>

        {cargando ? (
          <div className="mt-10 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Cargando…
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        ) : resultados.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <p className="text-gray-400">Todavía no has rendido ningún simulacro.</p>
            <Link to="/postulante/simulacro" className="mt-4 inline-block rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              Rendir mi primer simulacro
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <ResumenTarjeta valor={resultados.length} etiqueta="Simulacros rendidos" />
              <ResumenTarjeta valor={`${promedioPorcentaje}%`} etiqueta="Promedio general" />
              <ResumenTarjeta valor={`${resultados[resultados.length - 1]?.porcentaje ?? 0}%`} etiqueta="Último simulacro" />
            </div>

            {/* Mini gráfico de barras del progreso */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-300">
                <TrendingUp size={16} className="text-magenta-400" /> Evolución por intento
              </div>
              <div className="flex h-32 items-end gap-2">
                {resultados.map((r) => (
                  <div key={r.numeroIntento} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-brand-gradient transition-all"
                      style={{ height: `${Math.max(4, r.porcentaje)}%` }}
                      title={`${r.porcentaje}%`}
                    />
                    <span className="text-[10px] text-gray-500">#{r.numeroIntento}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Intento</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Aciertos</th>
                    <th className="px-4 py-3">Errores</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resultados.map((r) => (
                    <tr key={r.numeroIntento}>
                      <td className="px-4 py-3 font-medium text-white">#{r.numeroIntento}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(r.fecha).toLocaleDateString('es-PE')}</td>
                      <td className="px-4 py-3 text-emerald-300">{r.aciertos}</td>
                      <td className="px-4 py-3 text-red-300">{r.errores}</td>
                      <td className="px-4 py-3 text-gray-400">{r.total}</td>
                      <td className="px-4 py-3 font-semibold text-white">{r.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Link to="/postulante/simulacro" className="inline-block rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                Rendir otro simulacro
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ResumenTarjeta({ valor, etiqueta }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="font-display text-2xl font-bold text-white">{valor}</p>
      <p className="mt-1 text-xs text-gray-500">{etiqueta}</p>
    </div>
  );
}
