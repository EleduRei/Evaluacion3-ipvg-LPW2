/**
 * Cálculo del ranking (tabla de posiciones) a partir de los resultados oficiales.
 * Es una función pura (no usa la BD), por eso se puede probar fácilmente con Jest.
 * Los puntos NUNCA se ingresan a mano: siempre se derivan de los partidos jugados.
 */

export const PUNTOS = { VICTORIA: 3, EMPATE: 1, DERROTA: 0 };

export interface EquipoRanking {
  id: number;
  nombre: string;
}

export interface PartidoRanking {
  equipoLocalId: number;
  equipoVisitanteId: number;
  resultado?: { puntajeLocal: number; puntajeVisitante: number } | null;
}

export interface FilaRanking {
  posicion: number;
  equipoId: number;
  equipo: string;
  pj: number; // partidos jugados
  pg: number; // ganados
  pe: number; // empatados
  pp: number; // perdidos
  af: number; // anotaciones a favor
  ac: number; // anotaciones en contra
  dif: number; // diferencia
  puntos: number;
}

export function calcularRanking(equipos: EquipoRanking[], partidos: PartidoRanking[]): FilaRanking[] {
  // 1. Una fila en cero por cada equipo inscrito
  const tabla = new Map<number, FilaRanking>();
  for (const e of equipos) {
    tabla.set(e.id, {
      posicion: 0, equipoId: e.id, equipo: e.nombre,
      pj: 0, pg: 0, pe: 0, pp: 0, af: 0, ac: 0, dif: 0, puntos: 0,
    });
  }

  // 2. Sumar cada partido que tenga resultado oficial
  for (const p of partidos) {
    if (!p.resultado) continue;
    const local = tabla.get(p.equipoLocalId);
    const visita = tabla.get(p.equipoVisitanteId);
    if (!local || !visita) continue;

    const { puntajeLocal, puntajeVisitante } = p.resultado;
    local.pj++; visita.pj++;
    local.af += puntajeLocal; local.ac += puntajeVisitante;
    visita.af += puntajeVisitante; visita.ac += puntajeLocal;

    if (puntajeLocal > puntajeVisitante) {
      local.pg++; visita.pp++;
    } else if (puntajeLocal < puntajeVisitante) {
      visita.pg++; local.pp++;
    } else {
      local.pe++; visita.pe++;
    }
  }

  // 3. Puntos y diferencia, luego ordenar: puntos > diferencia > a favor > nombre
  const filas = [...tabla.values()].map((f) => ({
    ...f,
    puntos: f.pg * PUNTOS.VICTORIA + f.pe * PUNTOS.EMPATE + f.pp * PUNTOS.DERROTA,
    dif: f.af - f.ac,
  }));
  filas.sort(
    (a, b) =>
      b.puntos - a.puntos || b.dif - a.dif || b.af - a.af || a.equipo.localeCompare(b.equipo),
  );
  filas.forEach((f, i) => (f.posicion = i + 1));
  return filas;
}
