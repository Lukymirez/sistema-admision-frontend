import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Users, FileStack, CopyX, KeyRound, CheckCircle2, XCircle, ListChecks, Wallet, BadgeCheck, UserCog } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';
import { EstadoBadge, EstadoCargando, EstadoError } from '../../components/gestion-academica/shared';
import TabPreguntas from '../../components/gestion-academica/TabPreguntas';
import TabDocentes from '../../components/gestion-academica/TabDocentes';
import TabDuplicados from '../../components/gestion-academica/TabDuplicados';
import TabCartilla from '../../components/gestion-academica/TabCartilla';
import TabPostulantesCompleto from '../../components/gestion-postulantes/TabPostulantesCompleto';

const TABS = [
  { id: 'postulantes', label: 'Postulantes', icono: Users },
  { id: 'pagos', label: 'Pagos', icono: KeyRound },
  { id: 'preguntas', label: 'Preguntas', icono: ListChecks },
  { id: 'docentes', label: 'Docentes', icono: FileStack },
  { id: 'roles', label: 'Roles', icono: UserCog },
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
        {tabActivo === 'postulantes' && <TabPostulantesCompleto />}
        {tabActivo === 'pagos' && <TabPagos />}
        {tabActivo === 'preguntas' && <TabPreguntas />}
        {tabActivo === 'docentes' && <TabDocentes />}
        {tabActivo === 'roles' && <TabGestionRoles />}
        {tabActivo === 'duplicados' && <TabDuplicados />}
        {tabActivo === 'cartilla' && <TabCartilla />}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Gestión de roles: agregar/quitar docentes del Comité                    */
/* ---------------------------------------------------------------------- */
function TabGestionRoles() {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  const cargar = () => {
    setCargando(true);
    api
      .get('/auth/docentes')
      .then((res) => setDocentes(res.data?.docentes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar la lista.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiarRol = async (id, nuevoRol) => {
    setProcesandoId(id);
    try {
      await api.put(`/auth/docentes/${id}/rol`, { rol: nuevoRol });
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cambiar el rol.');
    } finally {
      setProcesandoId(null);
    }
  };

  if (cargando) return <EstadoCargando />;
  if (error) return <EstadoError mensaje={error} />;

  return (
    <div>
      <p className="mb-4 text-sm text-gray-400">
        Agrega un docente al Comité para que pueda validar preguntas, generar el examen y ver la
        cartilla de respuestas — o regrésalo a docente normal si ya no corresponde.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol actual</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {docentes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No hay docentes registrados.</td>
              </tr>
            ) : (
              docentes.map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-3">{d.nombres} {d.apellidos}</td>
                  <td className="px-4 py-3 text-gray-400">{d.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${d.rol === 'comite' ? 'bg-magenta-600/15 text-magenta-300' : 'bg-white/10 text-gray-300'}`}>
                      {d.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.rol === 'docente' ? (
                      <button
                        onClick={() => cambiarRol(d._id, 'comite')}
                        disabled={procesandoId === d._id}
                        className="rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        Agregar al Comité
                      </button>
                    ) : (
                      <button
                        onClick={() => cambiarRol(d._id, 'docente')}
                        disabled={procesandoId === d._id}
                        className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        Quitar del Comité
                      </button>
                    )}
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
/* Pagos: aprobar/rechazar vouchers — habilita la postulación (HU-02/17)   */
/* Exclusivo del Administrador — Tesorería solo "verifica" en su panel.    */
/* ---------------------------------------------------------------------- */
function TabPagos() {
  const [postulantes, setPostulantes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  const cargar = () => {
    setCargando(true);
    setError('');
    api
      .get('/auth/pagos', { params: filtroEstado ? { estado: filtroEstado } : {} })
      .then((res) => setPostulantes(res.data?.postulantes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudieron cargar los pagos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  const resolverPago = async (postulanteId, indice, estado) => {
    const comentario = estado === 'rechazado' ? window.prompt('Motivo del rechazo (se le mostrará al postulante):') : null;
    if (estado === 'rechazado' && comentario === null) return; // canceló el prompt

    setProcesando(`${postulanteId}-${indice}`);
    try {
      const res = await api.put(`/auth/pagos/${postulanteId}/${indice}`, { estado, comentario });
      if (res.data?.codigoPostulante) {
        alert(`¡Postulación habilitada! Código asignado: ${res.data.codigoPostulante}`);
      }
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo actualizar el pago.');
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
      setError('No se pudo descargar el PDF del pago.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-300">Estado del pago</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-magenta-400"
          >
            <option value="pendiente">Pendientes de revisión</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
            <option value="">Todos</option>
          </select>
        </label>
      </div>

      {error && <EstadoError mensaje={error} />}
      {cargando ? (
        <EstadoCargando />
      ) : postulantes.length === 0 ? (
        <p className="text-sm text-gray-500">No hay pagos con este filtro.</p>
      ) : (
        <div className="space-y-4">
          {postulantes.map((p) => (
            <div key={p._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-white">{p.nombres} {p.apellidos}</p>
                  <p className="text-xs text-gray-500">DNI {p.dni} · {p.email}</p>
                </div>
                {p.postulacionHabilitada ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    <BadgeCheck size={14} /> Habilitado — {p.codigoPostulante}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
                    Postulación no habilitada
                  </span>
                )}
                <button
                  onClick={() => descargarReportePago(p._id, `pago_${p.dni}.pdf`)}
                  className="ml-2 rounded-full border border-white/15 px-3 py-1 text-xs text-gray-300 transition hover:bg-white/5"
                >
                  Descargar PDF
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {p.matricula.pagos.map((pago, indice) => (
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
                        {pago.comentarioAdmin && (
                          <p className="mt-1 text-xs italic text-red-300">Motivo: {pago.comentarioAdmin}</p>
                        )}
                      </div>

                      {pago.estado === 'pendiente' ? (
                        <div className="flex flex-col items-end gap-2">
                          {pago.verificadoTesoreria ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-300">
                              <BadgeCheck size={12} /> Verificado por Tesorería
                            </span>
                          ) : (
                            <span className="text-xs text-amber-300">Aún sin verificar por Tesorería</span>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => resolverPago(p._id, indice, 'aprobado')}
                              disabled={procesando === `${p._id}-${indice}`}
                              className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} /> Aprobar
                            </button>
                            <button
                              onClick={() => resolverPago(p._id, indice, 'rechazado')}
                              disabled={procesando === `${p._id}-${indice}`}
                              className="flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
                            >
                              <XCircle size={13} /> Rechazar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <EstadoBadge activo={pago.estado === 'aprobado'} texto={pago.estado} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
