<script setup>
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import TeamBadge from './TeamBadge.vue';
import { partesFecha } from '../utils/formato';

const props = defineProps({
  partido: { type: Object, required: true },
  mostrarTorneo: { type: Boolean, default: false },
});

const fecha = computed(() => partesFecha(props.partido.fechaHora));

// 'ganador' | 'perdedor' | '' según el resultado oficial (null = empate o sin jugar)
function claseLado(equipoId) {
  const r = props.partido.resultado;
  if (!r || r.ganadorId === null) return '';
  return r.ganadorId === equipoId ? 'ganador' : 'perdedor';
}
</script>

<template>
  <RouterLink :to="`/partidos/${partido.id}`" class="partido">
    <div class="fecha-taco">
      <b>{{ fecha.dia }}</b>
      <span>{{ fecha.mes }}</span>
      <small>{{ fecha.hora }}</small>
    </div>

    <div class="partido-centro">
      <div class="partido-meta">
        <span>{{ partido.ronda }}</span>
        <span v-if="mostrarTorneo">{{ partido.torneo?.nombre }}</span>
      </div>
      <div class="partido-marcador">
        <div class="lado lado-local" :class="claseLado(partido.equipoLocalId)">
          <span class="nombre">{{ partido.equipoLocal?.nombre }}</span>
          <TeamBadge :nombre="partido.equipoLocal?.nombre" tamano="sm" />
        </div>
        <div v-if="partido.resultado" class="marcador">
          <b>{{ partido.resultado.puntajeLocal }}</b><b>{{ partido.resultado.puntajeVisitante }}</b>
        </div>
        <span v-else class="marcador-vs">VS</span>
        <div class="lado" :class="claseLado(partido.equipoVisitanteId)">
          <TeamBadge :nombre="partido.equipoVisitante?.nombre" tamano="sm" />
          <span class="nombre">{{ partido.equipoVisitante?.nombre }}</span>
        </div>
      </div>
    </div>

    <StatusBadge :estado="partido.estado" />
  </RouterLink>
</template>
