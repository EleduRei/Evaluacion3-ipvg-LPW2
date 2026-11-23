<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api/http';
import PartidoItem from '../components/PartidoItem.vue';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';

const partidos = ref([]);
const cargando = ref(true);
const error = ref('');

const busqueda = ref('');
const torneoId = ref('');
const estado = ref('');

// Torneos distintos presentes en el calendario (para el filtro)
const torneos = computed(() => {
  const mapa = new Map(partidos.value.map((p) => [p.torneo.id, p.torneo.nombre]));
  return [...mapa].map(([id, nombre]) => ({ id, nombre }));
});

const partidosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();
  return partidos.value.filter(
    (p) =>
      (!texto ||
        p.equipoLocal.nombre.toLowerCase().includes(texto) ||
        p.equipoVisitante.nombre.toLowerCase().includes(texto)) &&
      (!torneoId.value || p.torneo.id === torneoId.value) &&
      (!estado.value || p.estado === estado.value),
  );
});

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    partidos.value = await api('/partidos');
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);
</script>

<template>
  <section>
    <header class="encabezado">
      <div>
        <span class="eyebrow">Calendario</span>
        <h1>Partidos</h1>
        <p>Todos los enfrentamientos programados y sus resultados oficiales.</p>
      </div>
    </header>
    <div class="filtros">
      <input v-model.trim="busqueda" type="search" placeholder="Buscar por equipo..." />
      <select v-model="torneoId">
        <option value="">Todos los torneos</option>
        <option v-for="t in torneos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
      </select>
      <select v-model="estado">
        <option value="">Todos los estados</option>
        <option value="PROGRAMADO">Programados</option>
        <option value="FINALIZADO">Finalizados</option>
        <option value="CANCELADO">Cancelados</option>
      </select>
    </div>

    <LoadingSpinner v-if="cargando" texto="Cargando partidos..." />
    <div v-else-if="error">
      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />
      <button class="btn btn-ghost" @click="cargar">Reintentar</button>
    </div>
    <EmptyState v-else-if="partidosFiltrados.length === 0" titulo="No hay partidos para mostrar" icono="📅" />
    <div v-else>
      <p class="contador">{{ partidosFiltrados.length }} partido(s)</p>
      <div class="lista">
        <PartidoItem v-for="p in partidosFiltrados" :key="p.id" :partido="p" mostrar-torneo />
      </div>
    </div>
  </section>
</template>
