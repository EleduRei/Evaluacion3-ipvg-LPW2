<script setup>
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { ETIQUETAS, formatearFecha } from '../utils/formato';

const props = defineProps({ torneo: { type: Object, required: true } });

const inscritos = computed(() => props.torneo.inscritos ?? 0);
// Con cupos chicos se dibuja una casilla por equipo; con cupos grandes, una barra
const usarCasillas = computed(() => props.torneo.cupoMaximo <= 16);
const porcentaje = computed(() => Math.min(100, Math.round((inscritos.value / props.torneo.cupoMaximo) * 100)));

const COLOR_ESTADO = { ABIERTO: 'var(--senal)', EN_CURSO: 'var(--rojo)', FINALIZADO: 'var(--linea-fuerte)', CANCELADO: 'var(--linea-fuerte)' };
</script>

<template>
  <RouterLink
    :to="`/torneos/${torneo.id}`"
    class="tarjeta tarjeta-link"
    :style="{ '--color-estado': COLOR_ESTADO[torneo.estado] }"
  >
    <div class="tarjeta-cabecera">
      <span class="juego">{{ torneo.videojuego }}</span>
      <StatusBadge :estado="torneo.estado" />
    </div>
    <h3>{{ torneo.nombre }}</h3>
    <div class="meta">
      <span>{{ ETIQUETAS[torneo.modalidad] }}</span>
      <span>Inicio {{ formatearFecha(torneo.fechaInicio) }}</span>
    </div>
    <div class="cupo">
      <div v-if="usarCasillas" class="cupo-casillas">
        <i v-for="n in torneo.cupoMaximo" :key="n" :class="{ lleno: n <= inscritos }"></i>
      </div>
      <div v-else class="cupo-barra"><div class="cupo-relleno" :style="{ width: porcentaje + '%' }"></div></div>
      <small>{{ inscritos }} / {{ torneo.cupoMaximo }} equipos</small>
    </div>
    <div class="tarjeta-pie">
      <span></span>
      <span class="tarjeta-ir">Ver torneo →</span>
    </div>
  </RouterLink>
</template>
