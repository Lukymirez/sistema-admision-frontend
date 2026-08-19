import { Navigate } from 'react-router-dom';

import { estaAutenticado, tieneRol } from '../utils/auth';

/**
 * Envuelve una ruta que requiere sesión iniciada y, opcionalmente, uno de
 * los roles indicados. Si no cumple, redirige a /login.
 *
 * Uso:
 *   <Route path="/docente/preguntas" element={
 *     <ProtectedRoute roles={['docente', 'comite']}><BancoPreguntas /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ roles, children }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && !tieneRol(...roles)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
