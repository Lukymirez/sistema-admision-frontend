import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogOut, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

import api from '../../services/api';
import { getUsuario, cerrarSesion } from '../../utils/auth';

const MATERIA_LABEL = {
  matematica: 'Matemática',
  razonamiento: 'Razonamiento',
  comunicacion: 'Comunicación',
  historia: 'Historia',
  cultura: 'Cultura General',
  geografia: 'Geografía',
  ciencias: 'Ciencias',
};

export default function Simulacro() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [vista, setVista] = useState('cargando'); // cargando | inicio | rindiendo | resultado
  const [intentosRestantes, setIntentosRestantes] = useState(null);
  const [intento, setIntento] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({}); // { preguntaId: indiceSeleccionada }
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cargarEstadoInicial = () => {
    setVista('cargando');
    api
      .get('/simulacro/mis-resultados')
      .then((res) => setIntentosRestantes(res.data?.intentosRestantesHoy ?? 0))
      .catch(() => setIntentosRestantes(0))
      .finally(() => setVista('inicio'));
  };

  useEffect(() => {
    cargarEstadoInicial();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const iniciarSimulacro = async () => {
    setError('');
    try {
      const res = await api.post('/simulacro/iniciar');
      setIntento(res.data.intento);
      setPreguntaActual(0);
      setRespuestas({});
      setVista('rindiendo');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar el simulacro.');
    }
  };

  const seleccionarRespuesta = (preguntaId, indice) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: indice }));
  };

  const entregarSimulacro = async () => {
    setEnviando(true);
    setError('');
    try {
      const respuestasArray = Object.entries(respuestas).map(([preguntaId, indiceSeleccionada]) => ({
        preguntaId,
        indiceSeleccionada,
      }));
      const res = await api.post(`/simulacro/${intento._id}/finalizar`, { respuestas: respuestasArray });
      setResultado(res.data.resultado);
      setVista('resultado');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo entregar el simulacro.');
    } finally {
      setEnviando(false);
    }
  };

  // -------------------- VISTA: cargando --------------------
  if (vista === 'cargando') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-gray-400">
        Cargando…
      </div>
    );
  }

  // -------------------- VISTA: inicio --------------------
  if (vista === 'inicio') {
    return (
      <div className="min-h-screen bg-ink-950 font-sans text-white">
        <CabeceraSimulacro usuario={usuario} onLogout={handleLogout} />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient">
            <GraduationCap size={28} />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Simulacro de práctica</h1>
          <p className="mt-3 text-gray-400">
            Las preguntas salen en orden aleatorio y nunca se repiten entre tus intentos. Al terminar
            solo verás tu cantidad de aciertos y errores — no las respuestas correctas, para que
            sigan siendo útiles en tus próximos simulacros.
          </p>

          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-300">
            <Clock size={14} className="text-magenta-400" />
            Te quedan <strong className="text-white">{intentosRestantes}</strong> de 2 intentos hoy
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
          )}

          <div className="mt-8">
            {intentosRestantes > 0 ? (
              <button
                onClick={iniciarSimulacro}
                className="rounded-full bg-brand-gradient px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Iniciar simulacro
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Ya usaste tus 2 intentos de hoy. Vuelve mañana para seguir practicando.
              </p>
            )}
          </div>

          <Link to="/postulante" className="mt-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
            <ArrowLeft size={14} /> Volver a mi cuenta
          </Link>
        </main>
      </div>
    );
  }

  // -------------------- VISTA: rindiendo --------------------
  if (vista === 'rindiendo' && intento) {
    const pregunta = intento.preguntas[preguntaActual];
    const totalPreguntas = intento.preguntas.length;
    const respondidas = Object.keys(respuestas).length;
    const urlBackend = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

    return (
      <div className="min-h-screen bg-ink-950 font-sans text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <span className="font-display text-sm font-semibold text-white">
              Simulacro N° {intento.numeroIntento}
            </span>
            <span className="text-sm text-gray-400">
              {respondidas}/{totalPreguntas} respondidas
            </span>
          </div>
          <div className="h-1 w-full bg-white/5">
            <div
              className="h-full bg-brand-gradient transition-all"
              style={{ width: `${(respondidas / totalPreguntas) * 100}%` }}
            />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-full bg-magenta-600/15 px-3 py-1 text-xs font-medium capitalize text-magenta-300">
              {MATERIA_LABEL[pregunta.materia] || pregunta.materia}
            </span>
            <span className="text-xs text-gray-500">
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </span>
          </div>

          <h2 className="font-display text-lg font-semibold leading-relaxed text-white">{pregunta.enunciado}</h2>

          {pregunta.imagenUrl && (
            <img src={`${urlBackend}${pregunta.imagenUrl}`} alt="" className="mt-4 max-h-64 rounded-lg border border-white/10" />
          )}

          <div className="mt-6 space-y-3">
            {pregunta.alternativas.map((alternativa, index) => {
              const seleccionada = respuestas[pregunta.preguntaId] === index;
              return (
                <button
                  key={index}
                  onClick={() => seleccionarRespuesta(pregunta.preguntaId, index)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    seleccionada
                      ? 'border-magenta-400 bg-magenta-600/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      seleccionada ? 'border-magenta-400 bg-magenta-500 text-white' : 'border-white/20 text-gray-500'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {alternativa}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setPreguntaActual((p) => Math.max(0, p - 1))}
              disabled={preguntaActual === 0}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Anterior
            </button>

            {preguntaActual < totalPreguntas - 1 ? (
              <button
                onClick={() => setPreguntaActual((p) => Math.min(totalPreguntas - 1, p + 1))}
                className="flex items-center gap-1.5 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={entregarSimulacro}
                disabled={enviando}
                className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {enviando ? 'Entregando...' : 'Entregar simulacro'}
              </button>
            )}
          </div>

          {/* Panel de preguntas para saltar directamente */}
          <div className="mt-10 flex flex-wrap gap-2">
            {intento.preguntas.map((p, index) => (
              <button
                key={p.preguntaId}
                onClick={() => setPreguntaActual(index)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  index === preguntaActual
                    ? 'bg-brand-gradient text-white'
                    : respuestas[p.preguntaId] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // -------------------- VISTA: resultado --------------------
  if (vista === 'resultado' && resultado) {
    return (
      <div className="min-h-screen bg-ink-950 font-sans text-white">
        <CabeceraSimulacro usuario={usuario} onLogout={handleLogout} />
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-white">¡Simulacro entregado!</h1>
          <p className="mt-2 text-gray-400">Este fue tu intento N° {resultado.numeroIntento}.</p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <CheckCircle2 className="mx-auto text-emerald-400" size={28} />
              <p className="mt-2 font-display text-3xl font-bold text-white">{resultado.aciertos}</p>
              <p className="text-sm text-emerald-300">Aciertos</p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <XCircle className="mx-auto text-red-400" size={28} />
              <p className="mt-2 font-display text-3xl font-bold text-white">{resultado.errores}</p>
              <p className="text-sm text-red-300">Errores</p>
            </div>
          </div>

          <p className="mt-6 font-display text-lg font-semibold text-white">
            {resultado.porcentaje}% de {resultado.total} preguntas
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Por seguridad del banco de preguntas, no se muestran las respuestas correctas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/postulante/resultados"
              className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ver mi progreso completo
            </Link>
            <button
              onClick={cargarEstadoInicial}
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Volver al inicio del simulacro
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

function CabeceraSimulacro({ usuario, onLogout }) {
  return (
    <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link to="/postulante" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
            <GraduationCap size={20} />
          </span>
          Simulacro
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{usuario?.nombres}</span>
          <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-sm text-gray-300 transition hover:bg-white/5">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
