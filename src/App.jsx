import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import VerifyEmail from './pages/public/VerifyEmail';
import ExamRoom from './pages/applicant/ExamRoom';
import BancoPreguntas from './pages/docente/BancoPreguntas';
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

        {/* Vista protegida / del postulante */}
        <Route path="/applicant/exam" element={<ExamRoom />} />

        {/* Vista protegida — Docente/Comité: banco de preguntas */}
        <Route
          path="/docente/preguntas"
          element={
            <ProtectedRoute roles={['docente', 'comite']}>
              <BancoPreguntas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
