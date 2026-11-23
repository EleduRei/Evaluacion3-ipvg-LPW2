<script setup>
import { computed } from 'vue';
import TeamBadge from './TeamBadge.vue';

const props = defineProps({
  filas: { type: Array, default: () => [] },
  // { [equipoId]: ['G', 'E', 'P', ...] } últimos resultados de cada equipo
  forma: { type: Object, default: () => ({}) },
});

const hayPartidosJugados = computed(() => props.filas.some((f) => f.pj > 0));
const TITULOS = { G: 'Ganado', E: 'Empatado', P: 'Perdido' };
</script>

<template>
  <div>
    <p v-if="filas.length === 0" class="texto-suave">Aún no hay equipos aceptados en este torneo.</p>
    <template v-else>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>#</th><th class="col-equipo">Equipo</th>
              <th title="Partidos jugados">PJ</th><th title="Ganados">PG</th><th title="Empatados">PE</th>
              <th title="Perdidos">PP</th><th title="Anotaciones a favor">AF</th><th title="Anotaciones en contra">AC</th>
              <th title="Diferencia">DIF</th><th>Forma</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fila in filas" :key="fila.equipoId" :class="{ lider: fila.posicion === 1 && hayPartidosJugados }">
              <td class="pos">{{ fila.posicion }}</td>
              <td class="col-equipo">
                <RouterLink :to="`/equipos/${fila.equipoId}`">
                  <TeamBadge :nombre="fila.equipo" tamano="sm" />{{ fila.equipo }}
                </RouterLink>
              </td>
              <td class="num">{{ fila.pj }}</td><td class="num">{{ fila.pg }}</td><td class="num">{{ fila.pe }}</td>
              <td class="num">{{ fila.pp }}</td><td class="num">{{ fila.af }}</td><td class="num">{{ fila.ac }}</td>
              <td class="num">{{ fila.dif > 0 ? '+' + fila.dif : fila.dif }}</td>
              <td>
                <span v-if="forma[fila.equipoId]?.length" class="forma">
                  <i v-for="(r, i) in forma[fila.equipoId]" :key="i" :class="r" :title="TITULOS[r]">{{ r }}</i>
                </span>
                <span v-else class="texto-suave">—</span>
              </td>
              <td class="pts">{{ fila.puntos }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="texto-suave nota">
        Calculado automáticamente desde los resultados oficiales: victoria 3 pts, empate 1 pt, derrota 0 pts.
        Forma = últimos partidos (G ganado, E empate, P perdido).
      </p>
    </template>
  </div>
</template>
