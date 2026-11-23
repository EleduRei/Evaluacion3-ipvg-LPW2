<script setup>
// Mensaje reutilizable de éxito / error / información.
// props: tipo y mensaje.  emit: 'cerrar' para que el padre limpie el mensaje.
defineProps({
  tipo: { type: String, default: 'info' }, // 'exito' | 'error' | 'info'
  mensaje: { type: String, default: '' },
});
const emit = defineEmits(['cerrar']);
</script>

<template>
  <div v-if="mensaje" class="alerta" :class="`alerta-${tipo}`" role="alert">
    <span>{{ mensaje }}</span>
    <button class="alerta-cerrar" aria-label="Cerrar" @click="emit('cerrar')">×</button>
  </div>
</template>
