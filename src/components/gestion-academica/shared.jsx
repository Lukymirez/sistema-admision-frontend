import { Loader2, AlertTriangle } from 'lucide-react';

export const MATERIAS = ['matematica', 'razonamiento', 'comunicacion', 'historia', 'cultura', 'geografia', 'ciencias'];

export function EstadoBadge({ activo, texto }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
        activo ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
      }`}
    >
      {texto}
    </span>
  );
}

export function EstadoCargando() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Loader2 size={16} className="animate-spin" /> Cargando…
    </div>
  );
}

export function EstadoError({ mensaje }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <span>{mensaje}</span>
    </div>
  );
}

export function ResumenTarjeta({ titulo, datos, capitalizar }) {
  const entradas = Object.entries(datos);
  const total = entradas.reduce((sum, [, cantidad]) => sum + cantidad, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-sm font-semibold text-white">{titulo}</h3>
      <div className="mt-4 space-y-3">
        {entradas.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos todavía.</p>
        ) : (
          entradas.map(([etiqueta, cantidad]) => (
            <div key={etiqueta}>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className={capitalizar ? 'capitalize' : ''}>{etiqueta}</span>
                <span>{cantidad}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-brand-gradient"
                  style={{ width: `${total === 0 ? 0 : Math.round((cantidad / total) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
