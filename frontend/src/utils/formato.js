// Funciones de presentación reutilizadas por varias vistas.

/** Convierte 'YYYY-MM-DD' o ISO a Date sin desfase de zona horaria. */
function aFecha(valor) {
  if (!valor) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split('-').map(Number);
    return new Date(a, m - 1, d);
  }
  return new Date(valor);
}

export function formatearFecha(valor) {
  const f = aFecha(valor);
  return f ? f.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

export function formatearFechaHora(valor) {
  const f = aFecha(valor);
  return f
    ? f.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';
}

/** Partes sueltas de una fecha para mostrarla como "taco" de calendario. */
export function partesFecha(valor) {
  const f = aFecha(valor);
  if (!f) return { dia: '—', mes: '', hora: '' };
  return {
    dia: String(f.getDate()).padStart(2, '0'),
    mes: f.toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''),
    hora: f.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

/** "hoy", "mañana", "en 4 días", "hace 2 días". */
export function tiempoRelativo(valor) {
  const f = aFecha(valor);
  if (!f) return '';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia = new Date(f);
  dia.setHours(0, 0, 0, 0);
  const dias = Math.round((dia - hoy) / 86400000);
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias === -1) return 'ayer';
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`;
}

/** Valor para <input type="datetime-local"> (YYYY-MM-DDTHH:mm en hora local). */
export function aInputFechaHora(valor) {
  const f = aFecha(valor);
  if (!f) return '';
  const dos = (n) => String(n).padStart(2, '0');
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}T${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

export const ETIQUETAS = {
  ABIERTO: 'Inscripciones abiertas',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  PROGRAMADO: 'Programado',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  LIGA: 'Liga (todos contra todos)',
  ELIMINACION: 'Eliminación directa',
  ADMIN: 'Administrador',
  ESTUDIANTE: 'Estudiante',
};
