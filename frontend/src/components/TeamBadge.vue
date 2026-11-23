<script setup>
import { computed } from 'vue';

// Insignia de equipo: iniciales sobre un color que se deriva del nombre.
// El mismo nombre siempre produce el mismo color (función hash simple).
const props = defineProps({
  nombre: { type: String, default: '?' },
  tamano: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg' | 'xl'
});

const COLORES = ['#c6f432', '#ff6b3d', '#3dd6ff', '#ffc53d', '#ff4f8b', '#4dffa6', '#f2f2f2', '#ff9f1c'];

const iniciales = computed(() => {
  const palabras = props.nombre.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/);
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : palabras[0].slice(0, 2);
  return (letras || '?').toUpperCase();
});

const color = computed(() => {
  let hash = 0;
  for (const c of props.nombre) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return COLORES[hash % COLORES.length];
});
</script>

<template>
  <span class="team-badge" :class="`team-badge-${tamano}`" :style="{ '--color-equipo': color }" aria-hidden="true">
    {{ iniciales }}
  </span>
</template>
