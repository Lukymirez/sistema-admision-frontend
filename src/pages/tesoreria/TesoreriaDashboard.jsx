import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Wallet, CheckCircle2, Loader2, AlertTriangle, ShieldCheck, Download } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

export default function TesoreriaDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [postulantes, setPostulantes] = useState([]);
  const [filtro, setFiltro] = useState('sin-verificar');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  const cargar = () => {
    setCargando(true);
    setError('');
    api
      .get('/auth/pagos')
      .then((res) => setPostulantes(res.data?.postulantes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudieron cargar los pagos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const marcarVerificado = async (postulanteId, indice) => {
    setProcesando(`${postulanteId}-${indice}`);
    try {
      await api.put(`/auth/pagos/${postulanteId}/${indice}/verificar`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo marcar como verificado.');
    } finally {
      setProcesando(null);
    }
  };

  const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const descargarReportePago = async (postulanteId, nombreArchivo) => {
    try {
      const res = await api.get(`/auth/postulantes/${postulanteId}/reporte-pago`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo descargar el PDF.');
    }
  };

  // Aplanamos: un pago por fila, con los datos del postulante al lado.
  const filasPago = postulantes.flatMap((p) =>
    p.matricula.pagos.map((pago, indice) => ({ postulante: p, pago, indice }))
  );
  const filasFiltradas = filasPago.filter(({ pago }) => (filtro === 'sin-verificar' ? !pago.verificadoTesoreria : true));

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Tesorería — Verificación de pagos
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {usuario?.nombres} · <span className="capitalize text-magenta-300">{usuario?.rol}</span>
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-magenta-400" />
          Tu rol es confirmar, contra el sistema bancario, que cada voucher es real. Marcar un pago
          como "verificado" <strong className="text-gray-200">no lo aprueba ni habilita nada</strong> —
          esa decisión final la toma el área administrativa.
        </div>

        <div className="mb-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Mostrar</span>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="sin-verificar">Pendientes de verificar</option>
              <option value="todos">Todos los pagos</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Cargando…
          </div>
        ) : filasFiltradas.length === 0 ? (
          <p className="text-sm text-gray-500">No hay pagos con este filtro.</p>
        ) : (
          <div className="space-y-3">
            {filasFiltradas.map(({ postulante, pago, indice }) => (
              <div key={`${postulante._id}-${indice}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-white">{postulante.nombres} {postulante.apellidos}</p>
                    <p className="text-xs text-gray-500">DNI {postulante.dni}</p>

                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-300">
                        <Wallet size={13} className="text-magenta-400" /> S/. {pago.monto.toFixed(2)}
                      </span>
                      <span className="text-gray-400">N° operación: <strong className="text-gray-200">{pago.numeroOperacion}</strong></span>
                      <span className="text-gray-400">{new Date(pago.fecha).toLocaleDateString('es-PE')}</span>
                      <span className="text-gray-400">{pago.sede}{pago.ventanilla ? ` · Ventanilla ${pago.ventanilla}` : ''}</span>
                    </div>

                    <a href={`${urlBackend}${pago.voucherUrl}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-magenta-300 hover:underline">
                      Ver voucher adjunto
                    </a>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {pago.verificadoTesoreria ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                        <CheckCircle2 size={14} /> Verificado
                      </span>
                    ) : (
                      <button
                        onClick={() => marcarVerificado(postulante._id, indice)}
                        disabled={procesando === `${postulante._id}-${indice}`}
                        className="rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {procesando === `${postulante._id}-${indice}` ? 'Guardando...' : 'Marcar como verificado'}
                      </button>
                    )}
                    <button
                      onClick={() => descargarReportePago(postulante._id, `pago_${postulante.dni}.pdf`)}
                      className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5"
                    >
                      <Download size={12} /> Descargar PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
