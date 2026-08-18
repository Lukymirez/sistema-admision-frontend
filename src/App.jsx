import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import ExamRoom from './pages/applicant/ExamRoom';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Vistas públicas del sistema */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Vista protegida / del postulante */}
        <Route path="/applicant/exam" element={<ExamRoom />} />
      </Routes>
    </Router>
  );
}

export default App;