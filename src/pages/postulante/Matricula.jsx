import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ArrowLeft, Upload, CheckCircle2, Loader2, FileText, Wallet, Info, Plus, Trash2, AlertTriangle, BadgeCheck, Clock } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

const DOCUMENTOS = [
  {
    campo: 'fotoCarnetUrl',
    titulo: 'Foto tamaño carné',
    descripcion: 'Fondo blanco, formato PNG o JPG.',
    icono: FileText,
  },
  {
    campo: 'dniUrl',
    titulo: 'DNI (ambas caras)',
    descripcion: 'Anverso y reverso, en un solo PDF o imagen.',
    icono: FileText,
  },
  {
    campo: 'certificadoEstudiosUrl',
    titulo: 'Certificado de estudios secundarios',
    descripcion: 'Formato oficial, en blanco y negro está bien.',
    icono: FileText,
  },
  {
    campo: 'declaracionJuradaUrl',
    titulo: 'Declaraciones juradas',
    descripcion: 'Declaración de datos, de salud, y de no devolución de dinero.',
    icono: FileText,
  },
];

const PAGO_VACIO = { numeroOperacion: '', fecha: '', monto: '', sede: '', ventanilla: '' };

export default function Matricula() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [matricula, setMatricula] = useState({ pagos: [] });
  const [resumen, setResumen] = useState({ documentosCompletados: 0, documentosTotales: 4, montoTotalPagado: 0, montoRequerido: 150, pagoCompleto: false, postulacionHabilitada: false, codigoPostulante: null });
  const [cargando, setCargando] = useState(true);
  const [subiendoCampo, setSubiendoCampo] = useState(null);
  const [error, setError] = useState('');

  // Formulario para agregar un pago
  const [mostrarFormPago, setMostrarFormPago] = useState(false);
  const [archivoVoucher, setArchivoVoucher] = useState(null);
  const [formPago, setFormPago] = useState(PAGO_VACIO);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const cargar = () => {
    setCargando(true);
    api
      .get('/auth/mi-matricula')
      .then((res) => {
        setMatricula(res.data?.matricula || { pagos: [] });
        setResumen({
          documentosCompletados: res.data?.documentosCompletados ?? 0,
          documentosTotales: res.data?.documentosTotales ?? 4,
          montoTotalPagado: res.data?.montoTotalPagado ?? 0,
          montoRequerido: res.data?.montoRequerido ?? 150,
          pagoCompleto: res.data?.pagoCompleto ?? false,
          postulacionHabilitada: res.data?.postulacionHabilitada ?? false,
          codigoPostulante: res.data?.codigoPostulante ?? null,
        });
      })
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudo cargar tu matrícula.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const subirArchivo = async (campo, archivo) => {
    setError('');
    setSubiendoCampo(campo);
    try {
      const datosFormulario = new FormData();
      datosFormulario.append('documento', archivo);
      const resUpload = await api.post('/uploads/documento', datosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await api.put('/auth/mi-matricula', { campo, url: resUpload.data.url });
      setMatricula((prev) => ({ ...prev, ...res.data.matricula }));
      cargar(); // refresca contadores
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo subir el documento.');
    } finally {
      setSubiendoCampo(null);
    }
  };

  const registrarPago = async () => {
    setErrorPago('');
    if (!archivoVoucher) {
      setErrorPago('Adjunta la foto o el PDF del voucher.');
      return;
    }
    if (!formPago.numeroOperacion || !formPago.fecha || !formPago.monto || !formPago.sede) {
      setErrorPago('Completa número de operación, fecha, monto y sede — son obligatorios.');
      return;
    }

    setGuardandoPago(true);
    try {
      const datosFormulario = new FormData();
      datosFormulario.append('documento', archivoVoucher);
      const resUpload = await api.post('/uploads/documento', datosFormulario, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.post('/auth/mi-matricula/pago', {
        ...formPago,
        monto: Number(formPago.monto),
        voucherUrl: resUpload.data.url,
      });

      setFormPago(PAGO_VACIO);
      setArchivoVoucher(null);
      setMostrarFormPago(false);
      cargar();
    } catch (err) {
      setErrorPago(err.response?.data?.mensaje || 'No se pudo registrar el pago.');
    } finally {
      setGuardandoPago(false);
    }
  };

  const eliminarPago = async (indice) => {
    if (!window.confirm('¿Eliminar este pago registrado?')) return;
    try {
      await api.delete(`/auth/mi-matricula/pago/${indice}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo eliminar el pago.');
    }
  };

  const porcentajeDocumentos = Math.round((resumen.documentosCompletados / resumen.documentosTotales) * 100);
  const porcentajePago = Math.min(100, Math.round((resumen.montoTotalPagado / resumen.montoRequerido) * 100));
  const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-white">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/postulante" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap size={20} />
            </span>
            Completar matrícula
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{usuario?.nombres}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link to="/postulante" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
          <ArrowLeft size={14} /> Volver a mi cuenta
        </Link>

        <h1 className="font-display text-2xl font-bold text-white">Completa tu registro de admisión</h1>
        <p className="mt-2 text-sm text-gray-400">
          Sube estos documentos para dejar lista tu matrícula. Puedes hacerlo de a poco — se guarda
          cada uno apenas lo subes.
        </p>

        {!cargando && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              resumen.postulacionHabilitada
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            {resumen.postulacionHabilitada ? (
              <>
                <BadgeCheck size={18} className="shrink-0" />
                Postulación habilitada — tu código de postulante es <strong>{resumen.codigoPostulante}</strong>
              </>
            ) : (
              <>
                <Clock size={18} className="shrink-0" />
                Tu postulación aún no está habilitada — se activa automáticamente cuando el área
                administrativa valide tu pago.
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
        )}

        {cargando ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Cargando…
          </div>
        ) : (
          <>
            {/* Documentos */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Documentos</span>
                <span className="font-semibold text-white">
                  {resumen.documentosCompletados}/{resumen.documentosTotales}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-brand-gradient transition-all" style={{ width: `${porcentajeDocumentos}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {DOCUMENTOS.map((doc) => {
                const Icono = doc.icono;
                const yaSubido = Boolean(matricula[doc.campo]);
                const subiendo = subiendoCampo === doc.campo;

                return (
                  <div key={doc.campo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          yaSubido ? 'bg-emerald-500/15 text-emerald-400' : 'bg-brand-gradient text-white'
                        }`}
                      >
                        {yaSubido ? <CheckCircle2 size={20} /> : <Icono size={20} />}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-display text-base font-semibold text-white">{doc.titulo}</h3>
                        <p className="mt-0.5 text-sm text-gray-400">{doc.descripcion}</p>

                        {yaSubido && (
                          <a href={`${urlBackend}${matricula[doc.campo]}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-magenta-300 hover:underline">
                            Ver archivo subido
                          </a>
                        )}

                        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/5">
                          <Upload size={13} />
                          {subiendo ? 'Subiendo...' : yaSubido ? 'Reemplazar archivo' : 'Subir archivo'}
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, application/pdf"
                            disabled={subiendo}
                            onChange={(e) => {
                              const archivo = e.target.files?.[0];
                              if (archivo) subirArchivo(doc.campo, archivo);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pago del examen */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Wallet size={14} className="text-magenta-400" /> Pago del examen
                </span>
                <span className="font-semibold text-white">
                  S/. {resumen.montoTotalPagado.toFixed(2)} / S/. {resumen.montoRequerido.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-brand-gradient transition-all" style={{ width: `${porcentajePago}%` }} />
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-ink-900/50 p-3 text-xs text-gray-500">
                <Info size={14} className="mt-0.5 shrink-0 text-magenta-400" />
                Depósito en Banco de la Nación. Si pagaste en dos partes, registra cada voucher por
                separado — cada uno se valida con su propio número de operación para evitar duplicados.
              </div>
            </div>

            {/* Lista de pagos ya registrados */}
            {matricula.pagos?.length > 0 && (
              <div className="mt-4 space-y-3">
                {matricula.pagos.map((pago, index) => (
                  <div key={index} className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="text-sm">
                      <p className="font-semibold text-emerald-300">S/. {pago.monto.toFixed(2)}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        N° operación: {pago.numeroOperacion} · {new Date(pago.fecha).toLocaleDateString('es-PE')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pago.sede}
                        {pago.ventanilla ? ` · Ventanilla ${pago.ventanilla}` : ''}
                      </p>
                      <a href={`${urlBackend}${pago.voucherUrl}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-magenta-300 hover:underline">
                        Ver voucher
                      </a>
                    </div>
                    <button onClick={() => eliminarPago(index)} className="shrink-0 text-gray-500 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar un pago */}
            {matricula.pagos?.length < 2 && (
              <div className="mt-4">
                {!mostrarFormPago ? (
                  <button
                    onClick={() => setMostrarFormPago(true)}
                    className="flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-4 py-2.5 text-sm text-gray-300 transition hover:border-magenta-400/40 hover:text-white"
                  >
                    <Plus size={14} />
                    {matricula.pagos?.length > 0 ? 'Agregar otro pago (si pagaste en partes)' : 'Registrar pago del examen'}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="font-display text-base font-semibold text-white">Datos del voucher</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Copia los datos tal como aparecen en tu comprobante del Banco de la Nación.
                    </p>

                    {errorPago && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {errorPago}
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-400">N° de operación</span>
                        <input
                          value={formPago.numeroOperacion}
                          onChange={(e) => setFormPago({ ...formPago, numeroOperacion: e.target.value })}
                          placeholder="Ej: 000123456"
                          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-400">Monto pagado (S/.)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formPago.monto}
                          onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                          placeholder="150.00"
                          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-400">Fecha del pago</span>
                        <input
                          type="date"
                          value={formPago.fecha}
                          onChange={(e) => setFormPago({ ...formPago, fecha: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-400">Ventanilla / caja (opcional)</span>
                        <input
                          value={formPago.ventanilla}
                          onChange={(e) => setFormPago({ ...formPago, ventanilla: e.target.value })}
                          placeholder="Ej: 03"
                          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-xs text-gray-400">Sede / agencia donde pagaste</span>
                        <input
                          value={formPago.sede}
                          onChange={(e) => setFormPago({ ...formPago, sede: e.target.value })}
                          placeholder="Ej: Agencia San Miguel"
                          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-magenta-400"
                        />
                      </label>
                    </div>

                    <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/5">
                      <Upload size={13} />
                      {archivoVoucher ? archivoVoucher.name : 'Adjuntar foto o PDF del voucher'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, application/pdf"
                        onChange={(e) => setArchivoVoucher(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={registrarPago}
                        disabled={guardandoPago}
                        className="rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {guardandoPago ? 'Registrando...' : 'Registrar pago'}
                      </button>
                      <button
                        onClick={() => {
                          setMostrarFormPago(false);
                          setErrorPago('');
                        }}
                        className="rounded-full border border-white/15 px-5 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {resumen.documentosCompletados === resumen.documentosTotales && resumen.pagoCompleto && (
              <p className="mt-6 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <CheckCircle2 size={18} /> ¡Todo listo! Tu matrícula está completa, pendiente de
                validación del área administrativa.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
