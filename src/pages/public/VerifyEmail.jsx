import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import api from '../../services/api';

/**
 * Página a la que llega el usuario al hacer clic en el enlace del correo de
 * verificación (ver services/email.service.js en el backend, que arma la URL
 * como CLIENT_URL/verificar-correo/:token).
 */
export default function VerifyEmail() {
  const { token } = useParams();
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'exito' | 'error'
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api
      .get(`/auth/verificar/${token}`)
      .then((res) => {
        setEstado('exito');
        setMensaje(res.data?.mensaje || 'Correo verificado correctamente.');
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(err.response?.data?.mensaje || 'El enlace de verificación es inválido o expiró.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 font-sans text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        {estado === 'cargando' && (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-magenta-400" />
            <p className="mt-4 text-sm text-gray-400">Verificando tu correo…</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-white">¡Correo verificado!</h2>
            <p className="mt-3 text-sm text-gray-400">{mensaje}</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <XCircle size={28} />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-white">No se pudo verificar</h2>
            <p className="mt-3 text-sm text-gray-400">{mensaje}</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
