import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { LogIn, UserPlus, Mail, Lock, User, FileText } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Estados para Login
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // Estados para Register
  const [registerData, setRegisterData] = useState({ nombre: '', apellido: '', email: '', password: '', dni: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/postulantes/login', loginData);
      localStorage.setItem('token', response.data.token);
      alert('¡Inicio de sesión exitoso!');
      navigate('/applicant/exam');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/postulantes/register', registerData);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsRightPanelActive(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08060d] flex items-center justify-center p-4 font-sans text-white">
      {/* Contenedor principal con efecto Neón */}
      <div className={`relative w-[750px] h-[470px] bg-transparent rounded-2xl overflow-hidden shadow-[0_0_25px_#742f6c] border border-[#742f6c] flex items-center`}>
        
        {/* Formulario de Login */}
        <div className={`absolute left-0 w-1/2 h-full p-8 flex flex-col justify-center transition-all duration-700 ${isRightPanelActive ? 'translate-x-full opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h2 className="text-3xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div className="relative border-b border-white pb-1 flex items-center">
              <input
                type="email"
                required
                placeholder="Username / Email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400 pr-8"
              />
              <Mail size={16} className="text-gray-400 absolute right-0" />
            </div>

            <div className="relative border-b border-white pb-1 flex items-center">
              <input
                type="password"
                required
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400 pr-8"
              />
              <Lock size={16} className="text-gray-400 absolute right-0" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-semibold shadow-lg hover:opacity-90 transition">
              {loading ? 'Cargando...' : 'Login'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsRightPanelActive(true)} className="text-purple-400 font-bold hover:underline">
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* Formulario de Registro (Sign Up) */}
        <div className={`absolute left-0 w-1/2 h-full p-8 flex flex-col justify-center transition-all duration-700 ${!isRightPanelActive ? '-translate-x-full opacity-0 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <h2 className="text-2xl font-bold mb-2">Sign Up</h2>
            
            <div className="relative border-b border-white pb-1 flex items-center">
              <input
                type="text"
                required
                placeholder="Nombre"
                value={registerData.nombre}
                onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                className="w-full bg-transparent outline-none text-xs placeholder-gray-400 pr-6"
              />
              <User size={14} className="text-gray-400 absolute right-0" />
            </div>

            <div className="relative border-b border-white pb-1 flex items-center">
              <input
                type="email"
                required
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="w-full bg-transparent outline-none text-xs placeholder-gray-400 pr-6"
              />
              <Mail size={14} className="text-gray-400 absolute right-0" />
            </div>

            <div className="relative border-b border-white pb-1 flex items-center">
              <input
                type="password"
                required
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                className="w-full bg-transparent outline-none text-xs placeholder-gray-400 pr-6"
              />
              <Lock size={14} className="text-gray-400 absolute right-0" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 mt-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-semibold text-sm shadow-lg hover:opacity-90 transition">
              {loading ? 'Registrando...' : 'Sign Up'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRightPanelActive(false)} className="text-purple-400 font-bold hover:underline">
                Login
              </button>
            </p>
          </form>
        </div>

        {/* Panel Deslizante con Degradado Diagonal */}
        <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tr from-[#511378] to-[#250345] rounded-l-[150px] transition-transform duration-700 flex flex-col items-center justify-center text-center p-8 z-10 ${isRightPanelActive ? '-translate-x-full rounded-l-none rounded-r-[150px]' : ''}`}>
          <h2 className="text-3xl font-extrabold mb-2">WELCOME BACK!</h2>
          <p className="text-xs text-gray-200">Lorem ipsum, dolor sit amet consectetur adipisicing.</p>
        </div>

      </div>
    </div>
  );
}