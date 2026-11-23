<script setup>
import { computed } from 'vue';
import { ETIQUETAS } from '../utils/formato';

// Componente con v-model: el padre escribe  <FiltrosTorneos v-model="filtros" />
// Recibe el objeto por la prop modelValue y avisa los cambios con emit('update:modelValue').
const props = defineProps({
  modelValue: { type: Object, required: true },
  videojuegos: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue']);

// computed con get/set: permite usar v-model en cada input sin mutar la prop
function campo(nombre) {
  return computed({
    get: () => props.modelValue[nombre],
    set: (valor) => emit('update:modelValue', { ...props.modelValue, [nombre]: valor }),
  });
}
const q = campo('q');
const videojuego = campo('videojuego');
const estado = campo('estado');
const modalidad = campo('modalidad');

const hayFiltros = computed(() => Object.values(props.modelValue).some((v) => v !== ''));
function limpiar() {
  emit('update:modelValue', { q: '', videojuego: '', estado: '', modalidad: '' });
}
</script>

<template>
  <div class="filtros">
    <input v-model.trim="q" type="search" placeholder="Buscar por nombre o videojuego..." aria-label="Buscar" />
    <select v-model="videojuego" aria-label="Videojuego">
      <option value="">Todos los videojuegos</option>
      <option v-for="juego in videojuegos" :key="juego" :value="juego">{{ juego }}</option>
    </select>
    <select v-model="estado" aria-label="Estado">
      <option value="">Todos los estados</option>
      <option v-for="e in ['ABIERTO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO']" :key="e" :value="e">{{ ETIQUETAS[e] }}</option>
    </select>
    <select v-model="modalidad" aria-label="Modalidad">
      <option value="">Todas las modalidades</option>
      <option value="LIGA">Liga</option>
      <option value="ELIMINACION">Eliminación directa</option>
    </select>
    <button v-show="hayFiltros" class="btn btn-ghost btn-sm" @click="limpiar">Limpiar filtros</button>
  </div>
</template>
