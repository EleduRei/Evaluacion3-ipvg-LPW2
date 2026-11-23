import { calcularRanking, PUNTOS } from './ranking.util';

describe('calcularRanking (tabla de posiciones)', () => {
  const equipos = [
    { id: 1, nombre: 'Alfa' },
    { id: 2, nombre: 'Beta' },
    { id: 3, nombre: 'Gamma' },
  ];

  it('deja a todos los equipos en cero si no hay resultados', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 2, resultado: null }, // partido aún no jugado
    ]);
    expect(tabla).toHaveLength(3);
    tabla.forEach((fila) => {
      expect(fila.pj).toBe(0);
      expect(fila.puntos).toBe(0);
    });
  });

  it('suma 3 puntos por victoria, 1 por empate y 0 por derrota', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 2, resultado: { puntajeLocal: 3, puntajeVisitante: 1 } },
      { equipoLocalId: 2, equipoVisitanteId: 3, resultado: { puntajeLocal: 2, puntajeVisitante: 2 } },
    ]);
    const alfa = tabla.find((f) => f.equipoId === 1);
    const beta = tabla.find((f) => f.equipoId === 2);
    const gamma = tabla.find((f) => f.equipoId === 3);

    expect(alfa).toMatchObject({ pj: 1, pg: 1, pe: 0, pp: 0, puntos: PUNTOS.VICTORIA, af: 3, ac: 1, dif: 2 });
    expect(beta).toMatchObject({ pj: 2, pg: 0, pe: 1, pp: 1, puntos: PUNTOS.EMPATE });
    expect(gamma).toMatchObject({ pj: 1, pe: 1, puntos: PUNTOS.EMPATE });
  });

  it('ordena por puntos y desempata por diferencia', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 3, resultado: { puntajeLocal: 1, puntajeVisitante: 0 } },
      { equipoLocalId: 2, equipoVisitanteId: 3, resultado: { puntajeLocal: 5, puntajeVisitante: 0 } },
    ]);
    // Alfa y Beta tienen 3 pts, pero Beta tiene mejor diferencia (+5)
    expect(tabla.map((f) => f.equipo)).toEqual(['Beta', 'Alfa', 'Gamma']);
    expect(tabla.map((f) => f.posicion)).toEqual([1, 2, 3]);
  });

  it('ignora partidos de equipos que no están en la lista de inscritos', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 99, resultado: { puntajeLocal: 4, puntajeVisitante: 0 } },
    ]);
    expect(tabla.find((f) => f.equipoId === 1).pj).toBe(0);
  });
});
