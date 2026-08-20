import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import VerifyEmail from './pages/public/VerifyEmail';
import BancoPreguntas from './pages/docente/BancoPreguntas';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostulanteDashboard from './pages/postulante/PostulanteDashboard';
import Simulacro from './pages/postulante/Simulacro';
import Resultados from './pages/postulante/Resultados';
import MiCarrera from './pages/postulante/MiCarrera';
import Matricula from './pages/postulante/Matricula';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de inicio pública */}
        <Route path="/" element={<Home />} />

        {/* Vistas públicas del sistema */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-correo/:token" element={<VerifyEmail />} />

        {/* Vista protegida — Postulante */}
        <Route
          path="/postulante"
          element={
            <ProtectedRoute roles={['postulante']}>
              <PostulanteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postulante/simulacro"
          element={
            <ProtectedRoute roles={['postulante']}>
              <Simulacro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postulante/resultados"
          element={
            <ProtectedRoute roles={['postulante']}>
              <Resultados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postulante/carrera"
          element={
            <ProtectedRoute roles={['postulante']}>
              <MiCarrera />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postulante/matricula"
          element={
            <ProtectedRoute roles={['postulante']}>
              <Matricula />
            </ProtectedRoute>
          }
        />

        {/* Vista protegida — Docente/Comité: banco de preguntas */}
        <Route
          path="/docente/preguntas"
          element={
            <ProtectedRoute roles={['docente', 'comite']}>
              <BancoPreguntas />
            </ProtectedRoute>
          }
        />

        {/* Vista protegida — Administrador: panel administrativo */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['administrador']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
