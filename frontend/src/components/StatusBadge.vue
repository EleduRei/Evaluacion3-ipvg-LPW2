<script setup>
import { computed } from 'vue';
import { ETIQUETAS } from '../utils/formato';

const props = defineProps({ estado: { type: String, required: true } });

// computed: la clase de color se deriva del estado recibido por props
const clase = computed(() => {
  if (props.estado === 'EN_CURSO') return 'badge-vivo';
  if (['ABIERTO', 'ACEPTADA', 'ACTIVO'].includes(props.estado)) return 'badge-ok';
  if (props.estado === 'PENDIENTE') return 'badge-warn';
  if (props.estado === 'PROGRAMADO') return 'badge-info';
  if (['CANCELADO', 'RECHAZADA', 'INACTIVO'].includes(props.estado)) return 'badge-error';
  return 'badge-neutro';
});
</script>

<template>
  <span class="badge" :class="clase">{{ ETIQUETAS[estado] ?? estado }}</span>
</template>
