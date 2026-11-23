<script setup>
defineProps({ texto: { type: String, default: 'Cargando...' } });
</script>

<template>
  <div class="cargando">
    <span class="spinner" aria-hidden="true"></span>
    <span>{{ texto }}</span>
  </div>
</template>
