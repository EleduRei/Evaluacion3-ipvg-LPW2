<script setup>
// Diálogo de confirmación antes de eliminar.
// Se usa v-show (y no v-if) porque el diálogo se abre y cierra muchas veces:
// conviene mantenerlo en el DOM y solo alternar su visibilidad.
defineProps({
  visible: { type: Boolean, default: false },
  titulo: { type: String, default: '¿Confirmar acción?' },
  mensaje: { type: String, default: 'Esta acción no se puede deshacer.' },
  textoConfirmar: { type: String, default: 'Sí, eliminar' },
  procesando: { type: Boolean, default: false },
});
const emit = defineEmits(['confirmar', 'cancelar']);
</script>

<template>
  <div v-show="visible" class="modal-fondo" @click.self="emit('cancelar')">
    <div class="modal" role="dialog" aria-modal="true">
      <h3>{{ titulo }}</h3>
      <p>{{ mensaje }}</p>
      <div class="acciones">
        <button class="btn btn-ghost" :disabled="procesando" @click="emit('cancelar')">Cancelar</button>
        <button class="btn btn-peligro" :disabled="procesando" @click="emit('confirmar')">
          {{ procesando ? 'Procesando...' : textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>
