import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  FileText,
  Calendar,
  Home as HomeIcon,
  Phone,
  School,
  MapPinned,
  CheckCircle2,
} from 'lucide-react';

import api from '../../services/api';

const ESTADO_INICIAL = {
  // Cuenta
  email: '',
  password: '',
  confirmarPassword: '',
  // Datos personales (CU-03)
  nombres: '',
  apellidos: '',
  dni: '',
  fechaNacimiento: '',
  sexo: '',
  direccion: '',
  telefono: '',
  estadoCivil: '',
  // Datos académicos (CU-04)
  colegio: '',
  anioEgreso: '',
  modalidadIngreso: '',
  carreraId: '',
  sede: '',
  turno: '',
};

const PASOS = ['Cuenta', 'Datos personales', 'Datos académicos'];

export default function Register() {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  useEffect(() => {
    api
      .get('/carreras')
      .then((res) => setCarreras(res.data?.carreras || []))
      .catch(() => setCarreras([]));
  }, []);

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const validarPaso = () => {
    if (paso === 0) {
      if (!form.email || !form.password || !form.confirmarPassword) {
        return 'Completa todos los campos de la cuenta.';
      }
      if (form.password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
      }
      if (form.password !== form.confirmarPassword) {
        return 'Las contraseñas no coinciden.';
      }
    }
    if (paso === 1) {
      const requeridos = ['nombres', 'apellidos', 'dni', 'fechaNacimiento', 'sexo', 'direccion', 'telefono', 'estadoCivil'];
      if (requeridos.some((campo) => !form[campo])) {
        return 'Completa todos los datos personales.';
      }
      if (form.dni.length !== 8) {
        return 'El DNI debe tener 8 dígitos.';
      }
    }
    return '';
  };

  const siguientePaso = () => {
    const errorValidacion = validarPaso();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError('');
    setPaso((prev) => Math.min(prev + 1, PASOS.length - 1));
  };

  const pasoAnterior = () => {
    setError('');
    setPaso((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requeridosFinales = ['colegio', 'anioEgreso', 'modalidadIngreso', 'carreraId', 'sede', 'turno'];
    if (requeridosFinales.some((campo) => !form[campo])) {
      setError('Completa todos los datos académicos.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { confirmarPassword, ...datosRegistro } = form;
      await api.post('/auth/registro', datosRegistro);
      setRegistroExitoso(true);
    } catch (err) {
      const mensajeApi = err.response?.data?.mensaje || err.response?.data?.errores?.[0]?.msg;
      setError(mensajeApi || 'Ocurrió un error al registrarte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (registroExitoso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 font-sans">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-white">¡Cuenta creada!</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Tu cuenta quedó registrada como <strong className="text-gray-200">usuario temporal</strong>.
            Te enviamos un correo a <strong className="text-gray-200">{form.email}</strong> con un
            enlace para verificar tu cuenta. Revisa tu bandeja de entrada (y spam) antes de iniciar
            sesión.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 px-4 py-12 font-sans text-white">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
            <GraduationCap size={20} />
          </span>
          Admisión 2026
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40">
          <h1 className="font-display text-2xl font-bold text-white">Registro de postulante</h1>
          <p className="mt-1 text-sm text-gray-400">Completa los 3 pasos para crear tu cuenta.</p>

          {/* Indicador de pasos */}
          <div className="mt-6 flex items-center gap-2">
            {PASOS.map((nombrePaso, index) => (
              <div key={nombrePaso} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold transition ${
                    index <= paso ? 'bg-brand-gradient text-white' : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < PASOS.length - 1 && (
                  <div className={`h-0.5 flex-1 transition ${index < paso ? 'bg-magenta-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-magenta-300">{PASOS[paso]}</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {paso === 0 && (
              <>
                <Campo icono={Mail} label="Correo electrónico" type="email" value={form.email} onChange={actualizar('email')} placeholder="tucorreo@ejemplo.com" />
                <Campo icono={Lock} label="Contraseña" type="password" value={form.password} onChange={actualizar('password')} placeholder="Mínimo 8 caracteres" />
                <Campo icono={Lock} label="Confirmar contraseña" type="password" value={form.confirmarPassword} onChange={actualizar('confirmarPassword')} placeholder="Repite tu contraseña" />
              </>
            )}

            {paso === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Campo icono={User} label="Nombres" value={form.nombres} onChange={actualizar('nombres')} placeholder="Juan Carlos" />
                  <Campo icono={User} label="Apellidos" value={form.apellidos} onChange={actualizar('apellidos')} placeholder="Pérez Gómez" />
                </div>
                <Campo icono={FileText} label="DNI" value={form.dni} onChange={actualizar('dni')} placeholder="8 dígitos" maxLength={8} />
                <div className="grid grid-cols-2 gap-4">
                  <Campo icono={Calendar} label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={actualizar('fechaNacimiento')} />
                  <CampoSelect
                    label="Sexo"
                    value={form.sexo}
                    onChange={actualizar('sexo')}
                    opciones={[
                      { value: 'masculino', label: 'Masculino' },
                      { value: 'femenino', label: 'Femenino' },
                      { value: 'otro', label: 'Otro' },
                    ]}
                  />
                </div>
                <Campo icono={HomeIcon} label="Dirección" value={form.direccion} onChange={actualizar('direccion')} placeholder="Jr./Av. y número" />
                <div className="grid grid-cols-2 gap-4">
                  <Campo icono={Phone} label="Teléfono" value={form.telefono} onChange={actualizar('telefono')} placeholder="9XX XXX XXX" />
                  <CampoSelect
                    label="Estado civil"
                    value={form.estadoCivil}
                    onChange={actualizar('estadoCivil')}
                    opciones={[
                      { value: 'soltero', label: 'Soltero(a)' },
                      { value: 'casado', label: 'Casado(a)' },
                      { value: 'viudo', label: 'Viudo(a)' },
                      { value: 'divorciado', label: 'Divorciado(a)' },
                    ]}
                  />
                </div>
              </>
            )}

            {paso === 2 && (
              <>
                <Campo icono={School} label="Colegio de procedencia" value={form.colegio} onChange={actualizar('colegio')} placeholder="Nombre del colegio" />
                <div className="grid grid-cols-2 gap-4">
                  <Campo icono={Calendar} label="Año de egreso" type="number" value={form.anioEgreso} onChange={actualizar('anioEgreso')} placeholder="2025" />
                  <CampoSelect
                    label="Modalidad de ingreso"
                    value={form.modalidadIngreso}
                    onChange={actualizar('modalidadIngreso')}
                    opciones={[
                      { value: 'ordinario', label: 'Ordinario' },
                      { value: 'CEPRE', label: 'CEPRE' },
                      { value: 'traslado', label: 'Traslado' },
                      { value: 'EBR/EBA', label: 'EBR / EBA' },
                    ]}
                  />
                </div>
                <CampoSelect
                  label="Carrera elegida"
                  value={form.carreraId}
                  onChange={actualizar('carreraId')}
                  placeholder={carreras.length === 0 ? 'No hay carreras cargadas todavía' : 'Selecciona una carrera'}
                  opciones={carreras.map((c) => ({ value: c._id, label: c.nombre }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Campo icono={MapPinned} label="Sede" value={form.sede} onChange={actualizar('sede')} placeholder="Sede principal" />
                  <CampoSelect
                    label="Turno"
                    value={form.turno}
                    onChange={actualizar('turno')}
                    opciones={[
                      { value: 'diurno', label: 'Diurno (mañana)' },
                      { value: 'nocturno', label: 'Nocturno' },
                    ]}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              {paso > 0 ? (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                  Atrás
                </button>
              ) : (
                <span />
              )}

              {paso < PASOS.length - 1 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Crear mi cuenta'}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-magenta-300 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Campo({ icono: Icono, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <div className="relative">
        {Icono && <Icono size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />}
        <input
          {...props}
          required
          className={`w-full rounded-lg border border-white/10 bg-ink-900 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-magenta-400 ${
            Icono ? 'pl-10 pr-3' : 'px-3'
          }`}
        />
      </div>
    </label>
  );
}

function CampoSelect({ label, opciones, placeholder = 'Selecciona una opción', ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <select
        {...props}
        required
        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-magenta-400"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </label>
  );
}
