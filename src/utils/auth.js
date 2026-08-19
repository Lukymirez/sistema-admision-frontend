/**
 * Utilidades de autenticación en el cliente. El login (ver Login.jsx) guarda
 * el token y los datos del usuario (incluido su rol) en localStorage.
 */

export const getToken = () => localStorage.getItem('token');

export const getUsuario = () => {
  const crudo = localStorage.getItem('usuario');
  if (!crudo) return null;
  try {
    return JSON.parse(crudo);
  } catch {
    return null;
  }
};

export const estaAutenticado = () => Boolean(getToken());

export const tieneRol = (...rolesPermitidos) => {
  const usuario = getUsuario();
  return Boolean(usuario) && rolesPermitidos.includes(usuario.rol);
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

/** A dónde debe ir cada rol justo después de iniciar sesión. */
export const rutaSegunRol = (rol) => {
  switch (rol) {
    case 'docente':
    case 'comite':
      return '/docente/preguntas';
    case 'administrador':
      return '/admin';
    default:
      return '/applicant/exam';
  }
};
