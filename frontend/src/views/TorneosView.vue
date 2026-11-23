<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import FiltrosTorneos from '../components/FiltrosTorneos.vue';
import TorneoCard from '../components/TorneoCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import AlertMessage from '../components/AlertMessage.vue';

const { esAdmin } = useAuth();

const torneos = ref([]);
const cargando = ref(true);
const error = ref('');
const filtros = ref({ q: '', videojuego: '', estado: '', modalidad: '' });

// Lista de videojuegos sin repetir, para el filtro
const videojuegos = computed(() => [...new Set(torneos.value.map((t) => t.videojuego))].sort());

// Búsqueda por texto + filtros combinables (todos se aplican a la vez)
const torneosFiltrados = computed(() => {
  const texto = filtros.value.q.toLowerCase();
  return torneos.value.filter(
    (t) =>
      (!texto || t.nombre.toLowerCase().includes(texto) || t.videojuego.toLowerCase().includes(texto)) &&
      (!filtros.value.videojuego || t.videojuego === filtros.value.videojuego) &&
      (!filtros.value.estado || t.estado === filtros.value.estado) &&
      (!filtros.value.modalidad || t.modalidad === filtros.value.modalidad),
  );
});

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    torneos.value = await api('/torneos');
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
        <span class="eyebrow">Competencias</span>
        <h1>Torneos</h1>
        <p>Busca por nombre o videojuego y combina filtros de estado y modalidad.</p>
      </div>
      <RouterLink v-if="esAdmin" to="/torneos/nuevo" class="btn btn-primario">+ Nuevo torneo</RouterLink>
    </header>

    <FiltrosTorneos v-model="filtros" :videojuegos="videojuegos" />

    <LoadingSpinner v-if="cargando" texto="Cargando torneos..." />
    <div v-else-if="error">
      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />
      <button class="btn btn-ghost" @click="cargar">Reintentar</button>
    </div>
    <EmptyState
      v-else-if="torneos.length === 0"
      titulo="Todavía no hay torneos"
      texto="Cuando el administrador cree un torneo aparecerá aquí."
      icono="🏆"
    />
    <EmptyState
      v-else-if="torneosFiltrados.length === 0"
      titulo="Sin resultados"
      texto="Ningún torneo coincide con la búsqueda o los filtros seleccionados."
      icono="🔎"
    />
    <template v-else>
      <p class="contador">Mostrando {{ torneosFiltrados.length }} de {{ torneos.length }} torneos</p>
      <div class="grilla">
        <TorneoCard v-for="torneo in torneosFiltrados" :key="torneo.id" :torneo="torneo" />
      </div>
    </template>
  </section>
</template>
