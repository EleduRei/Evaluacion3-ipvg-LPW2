<script setup>
defineProps({
  titulo: { type: String, default: 'No hay datos para mostrar' },
  texto: { type: String, default: '' },
  icono: { type: String, default: '🕹️' },
});
</script>

<template>
  <div class="vacio">
    <div class="vacio-icono" aria-hidden="true">{{ icono }}</div>
    <h3>{{ titulo }}</h3>
    <p v-if="texto">{{ texto }}</p>
    <!-- slot: el padre puede agregar un botón de acción -->
    <slot />
  </div>
</template>
