import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Download,
  BadgeCheck,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

const ESTADOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'sin-pago', label: 'Sin pago registrado' },
  { value: 'sin-verificar', label: 'Con pago(s) sin verificar' },
  { value: 'verificado', label: 'Verificado, esperando aprobación' },
  { value: 'habilitado', label: 'Habilitado' },
];

/** Calcula el estado de seguimiento de un postulante para esta pantalla. */
const calcularEstado = (p) => {
  if (p.postulacionHabilitada) return 'habilitado';
  const pagos = p.matricula?.pagos || [];
  if (pagos.length === 0) return 'sin-pago';
  if (pagos.some((pg) => !pg.verificadoTesoreria)) return 'sin-verificar';
  return 'verificado';
};

const ESTADO_INFO = {
  'sin-pago': { texto: 'Sin pago registrado', clase: 'bg-red-500/15 text-red-300', icono: XCircle },
  'sin-verificar': { texto: 'Pago(s) sin verificar', clase: 'bg-amber-500/15 text-amber-300', icono: Clock },
  verificado: { texto: 'Verificado, esperando aprobación', clase: 'bg-blue-500/15 text-blue-300', icono: ShieldCheck },
  habilitado: { texto: 'Habilitado', clase: 'bg-emerald-500/15 text-emerald-300', icono: BadgeCheck },
};

/**
 * Panel de Tesorería: seguimiento fidedigno de TODOS los postulantes, no
 * solo los que ya subieron un voucher. Así se ve de un vistazo quiénes
 * todavía no han iniciado su proceso de pago.
 */
export default function TesoreriaDashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [postulantes, setPostulantes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [expandidoId, setExpandidoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  const cargar = () => {
    setCargando(true);
    setError('');
    api
      .get('/auth/postulantes')
      .then((res) => setPostulantes(res.data?.postulantes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar la lista de postulantes.'))
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
      setError('No se pudo descargar el PDF. (Puede que este postulante no tenga pagos registrados todavía.)');
    }
  };

  const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  const postulantesConEstado = postulantes.map((p) => ({ ...p, _estado: calcularEstado(p) }));
  const filtrados = filtroEstado ? postulantesConEstado.filter((p) => p._estado === filtroEstado) : postulantesConEstado;

  const resumen = postulantesConEstado.reduce((acc, p) => {
    acc[p._estado] = (acc[p._estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Tesorería — Seguimiento de pagos
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

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-magenta-400" />
          Tu rol es confirmar, contra el sistema bancario, que cada voucher es real. Marcar un pago
          como "verificado" <strong className="text-gray-200">no lo aprueba ni habilita nada</strong> —
          esa decisión final la toma el área administrativa. Esta lista incluye a{' '}
          <strong className="text-gray-200">todos los postulantes</strong>, incluso los que aún no
          han subido ningún pago.
        </div>

        {/* Resumen rápido */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(ESTADO_INFO).map(([clave, info]) => {
            const Icono = info.icono;
            return (
              <button
                key={clave}
                onClick={() => setFiltroEstado(filtroEstado === clave ? '' : clave)}
                className={`rounded-xl border p-3 text-left transition ${
                  filtroEstado === clave ? 'border-magenta-400 bg-magenta-600/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                }`}
              >
                <span className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs ${info.clase}`}>
                  <Icono size={11} /> {info.texto}
                </span>
                <p className="mt-2 font-display text-xl font-bold text-white">{resumen[clave] || 0}</p>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Filtrar por estado</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
            >
              {ESTADOS_FILTRO.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
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
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-gray-500">No hay postulantes con este filtro.</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map((p) => {
              const info = ESTADO_INFO[p._estado];
              const Icono = info.icono;
              const expandido = expandidoId === p._id;
              const pagos = p.matricula?.pagos || [];

              return (
                <div key={p._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <button
                    onClick={() => setExpandidoId(expandido ? null : p._id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="font-display font-semibold text-white">{p.nombres} {p.apellidos}</p>
                      <p className="text-xs text-gray-500">DNI {p.dni} · {p.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${info.clase}`}>
                        <Icono size={13} /> {info.texto}
                      </span>
                      {expandido ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </div>
                  </button>

                  {expandido && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      {pagos.length === 0 ? (
                        <p className="text-sm text-gray-500">Este postulante todavía no ha registrado ningún pago.</p>
                      ) : (
                        <>
                          <div className="mb-3 flex justify-end">
                            <button
                              onClick={() => descargarReportePago(p._id, `pago_${p.dni}.pdf`)}
                              className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5"
                            >
                              <Download size={12} /> Descargar PDF con todos los vouchers
                            </button>
                          </div>
                          <div className="space-y-3">
                            {pagos.map((pago, indice) => (
                              <div key={indice} className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="text-sm">
                                    <p className="flex items-center gap-1.5 font-semibold text-white">
                                      <Wallet size={14} className="text-magenta-400" /> S/. {pago.monto.toFixed(2)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">N° operación: {pago.numeroOperacion}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(pago.fecha).toLocaleDateString('es-PE')} · {pago.sede}
                                      {pago.ventanilla ? ` · Ventanilla ${pago.ventanilla}` : ''}
                                    </p>
                                    <a href={`${urlBackend}${pago.voucherUrl}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-magenta-300 hover:underline">
                                      Ver voucher
                                    </a>
                                  </div>
                                  {pago.verificadoTesoreria ? (
                                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                                      <CheckCircle2 size={14} /> Verificado
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => marcarVerificado(p._id, indice)}
                                      disabled={procesando === `${p._id}-${indice}`}
                                      className="shrink-0 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                    >
                                      {procesando === `${p._id}-${indice}` ? 'Guardando...' : 'Marcar como verificado'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
