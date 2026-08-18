import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Send } from 'lucide-react';

export default function ExamRoom() {
  const navigate = useNavigate();
  // Tiempo de examen en segundos (ej: 30 minutos = 1800 segundos)
  const [timeLeft, setTimeLeft] = useState(1800);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Simulación de preguntas del examen de admisión
  const questions = [
    {
      id: 1,
      question: '¿Cuál es el resultado de la operación: 5 + 3 * 2?',
      options: ['16', '11', '13', '10'],
    },
    {
      id: 2,
      question: '¿Qué componente del Stack MERN se encarga de la base de datos no relacional?',
      options: ['Express.js', 'React.js', 'MongoDB', 'Node.js'],
    },
    {
      id: 3,
      question: '¿En qué año se lanzó oficialmente React?',
      options: ['2011', '2013', '2015', '2010'],
    },
  ];

  // Control del cronómetro regresivo
  useEffect(() => {
    if (timeLeft <= 0) {
      alert('¡El tiempo ha terminado!');
      navigate('/applicant/results');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  // Formatear segundos a MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleSubmitExam = () => {
    if (window.confirm('¿Estás seguro de enviar tu examen? No podrás modificar tus respuestas.')) {
      navigate('/applicant/results');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Barra superior con cronómetro */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Examen de Admisión - Instituto</h1>
        <div className="flex items-center space-x-2 bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/30">
          <Clock size={20} />
          <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Contenido principal de la evaluación */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Panel de Pregunta Actual */}
        <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-sm text-indigo-400 font-semibold mb-2">
              Pregunta {currentQuestion + 1} de {questions.length}
            </div>
            <h2 className="text-lg font-medium text-white mb-6">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-indigo-500 cursor-pointer transition"
                >
                  <input type="radio" name={`question-${currentQuestion}`} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-slate-200">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-700">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition"
            >
              Anterior
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1))}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center space-x-2 transition"
              >
                <Send size={18} />
                <span>Finalizar Examen</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel lateral de navegación de preguntas */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Panel de Preguntas</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`py-2 rounded-lg font-medium text-sm transition ${
                  currentQuestion === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 text-xs text-slate-500 flex items-start space-x-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>Asegúrate de revisar tus respuestas antes de hacer clic en Finalizar Examen.</span>
          </div>
        </div>

      </main>
    </div>
  );
}