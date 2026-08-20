import { useEffect, useState } from 'react';
import { Search, Download, Mail, Phone, Loader2, AlertTriangle } from 'lucide-react';

import api from '../../services/api';

const FILTRO_VACIO = {
  carreraId: '',
  turno: '',
  modalidadIngreso: '',
  postulacionHabilitada: '',
  estadoCuenta: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: '',
};

/**
 * Lista completa de postulantes con todos los filtros necesarios para dar
 * seguimiento (Secretaría Académica) y descargar reportes. La usan tanto
 * el panel de Administrador como el de Secretaría — mismos permisos en
 * el backend (GET /auth/postulantes y /auth/postulantes/reporte).
 *
 * Se incluyen correo y teléfono de cada postulante porque son los datos
 * que se usan para contactarlo si necesita regularizar algún documento
 * presencialmente.
 */
export default function TabPostulantesCompleto() {
  const [postulantes, setPostulantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [filtro, setFiltro] = useState(FILTRO_VACIO);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/carreras').then((res) => setCarreras(res.data?.carreras || [])).catch(() => setCarreras([]));
  }, []);

  const construirParams = () => {
    const params = {};
    Object.entries(filtro).forEach(([clave, valor]) => {
      if (valor !== '') params[clave] = valor;
    });
    return params;
  };

  const buscar = () => {
    setCargando(true);
    setError('');
    api
      .get('/auth/postulantes', { params: construirParams() })
      .then((res) => setPostulantes(res.data?.postulantes || []))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar la lista de postulantes.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limpiarFiltros = () => {
    setFiltro(FILTRO_VACIO);
  };

  const descargarReporte = async () => {
    setDescargando(true);
    setError('');
    try {
      const res = await api.get('/auth/postulantes/reporte', { params: construirParams(), responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `postulantes_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('No se pudo descargar el reporte.');
    } finally {
      setDescargando(false);
    }
  };

  const montoPagado = (p) => (p.matricula?.pagos || []).filter((pg) => pg.estado === 'aprobado').reduce((s, pg) => s + pg.monto, 0);

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-white">Filtros</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Carrera</span>
            <select
              value={filtro.carreraId}
              onChange={(e) => setFiltro({ ...filtro, carreraId: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="">Todas</option>
              {carreras.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Turno</span>
            <select
              value={filtro.turno}
              onChange={(e) => setFiltro({ ...filtro, turno: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="">Todos</option>
              <option value="diurno">Diurno</option>
              <option value="nocturno">Nocturno</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Modalidad</span>
            <select
              value={filtro.modalidadIngreso}
              onChange={(e) => setFiltro({ ...filtro, modalidadIngreso: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="">Todas</option>
              <option value="ordinario">Ordinario</option>
              <option value="CEPRE">CEPRE</option>
              <option value="traslado">Traslado</option>
              <option value="EBR/EBA">EBR / EBA</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Postulación habilitada</span>
            <select
              value={filtro.postulacionHabilitada}
              onChange={(e) => setFiltro({ ...filtro, postulacionHabilitada: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Estado de cuenta</span>
            <select
              value={filtro.estadoCuenta}
              onChange={(e) => setFiltro({ ...filtro, estadoCuenta: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            >
              <option value="">Todos</option>
              <option value="temporal">Temporal</option>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Registrado desde</span>
            <input
              type="date"
              value={filtro.fechaDesde}
              onChange={(e) => setFiltro({ ...filtro, fechaDesde: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Registrado hasta</span>
            <input
              type="date"
              value={filtro.fechaHasta}
              onChange={(e) => setFiltro({ ...filtro, fechaHasta: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Buscar (nombre, DNI o correo)</span>
            <input
              value={filtro.busqueda}
              onChange={(e) => setFiltro({ ...filtro, busqueda: e.target.value })}
              placeholder="Ej: Pérez, 12345678..."
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-magenta-400"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={buscar}
            className="flex items-center gap-1.5 rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Search size={14} /> Buscar
          </button>
          <button
            onClick={limpiarFiltros}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-gray-300 transition hover:bg-white/5"
          >
            Limpiar filtros
          </button>
          <button
            onClick={descargarReporte}
            disabled={descargando}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Download size={14} /> {descargando ? 'Descargando…' : 'Descargar reporte (CSV)'}
          </button>
        </div>
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Carrera</th>
                <th className="px-4 py-3">Turno</th>
                <th className="px-4 py-3">Habilitado</th>
                <th className="px-4 py-3">Pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {postulantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No hay postulantes con estos filtros.
                  </td>
                </tr>
              ) : (
                postulantes.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3">
                      {p.nombres} {p.apellidos}
                      {p.codigoPostulante && <p className="text-xs text-magenta-300">{p.codigoPostulante}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.dni}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Mail size={11} /> {p.email}</span>
                      {p.telefono && <span className="mt-0.5 flex items-center gap-1"><Phone size={11} /> {p.telefono}</span>}
                    </td>
                    <td className="px-4 py-3">{p.carreraId?.nombre || '—'}</td>
                    <td className="px-4 py-3 capitalize">{p.turno || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${p.postulacionHabilitada ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {p.postulacionHabilitada ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">S/. {montoPagado(p).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
