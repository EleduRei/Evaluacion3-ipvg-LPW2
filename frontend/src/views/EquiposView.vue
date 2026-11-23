<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import StatusBadge from '../components/StatusBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import TeamBadge from '../components/TeamBadge.vue';

const router = useRouter();
const { usuario } = useAuth();

const equipos = ref([]);
const cargando = ref(true);
const error = ref('');

// Búsqueda y filtros
const busqueda = ref('');
const juego = ref('');
const soloMios = ref(false);

const esMio = (equipo) => equipo.integrantes.some((i) => i.id === usuario.value?.id);
const juegos = computed(() => [...new Set(equipos.value.map((e) => e.juegoPreferido))].sort());
const equiposFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();
  return equipos.value.filter(
    (e) =>
      (!texto || e.nombre.toLowerCase().includes(texto) || e.capitan.alias.toLowerCase().includes(texto)) &&
      (!juego.value || e.juegoPreferido === juego.value) &&
      (!soloMios.value || esMio(e)),
  );
});

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    equipos.value = await api('/equipos');
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);

// ---------- Crear equipo ----------
const mostrarFormulario = ref(false);
const nuevo = ref({ nombre: '', juegoPreferido: '' });
const enviado = ref(false);
const guardando = ref(false);
const errorForm = ref('');

const errores = computed(() => {
  const e = {};
  if (nuevo.value.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres';
  if (!nuevo.value.juegoPreferido.trim()) e.juegoPreferido = 'Indique el juego preferido';
  return e;
});

async function crearEquipo() {
  enviado.value = true;
  errorForm.value = '';
  if (Object.keys(errores.value).length) return;
  guardando.value = true;
  try {
    const equipo = await api('/equipos', {
      method: 'POST',
      body: { nombre: nuevo.value.nombre.trim(), juegoPreferido: nuevo.value.juegoPreferido.trim() },
    });
    router.push(`/equipos/${equipo.id}`);
  } catch (e) {
    errorForm.value = e.message;
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <section>
    <header class="encabezado">
      <div>
        <span class="eyebrow">Plantillas</span>
        <h1>Equipos</h1>
        <p>Crea tu equipo, suma integrantes e inscríbelo en los torneos abiertos.</p>
      </div>
      <button class="btn" :class="mostrarFormulario ? 'btn-ghost' : 'btn-primario'" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cerrar' : '+ Crear equipo' }}
      </button>
    </header>

    <form v-if="mostrarFormulario" class="panel form-grid" novalidate @submit.prevent="crearEquipo">
      <p class="col-completa texto-suave">Al crear el equipo quedarás como su capitán.</p>
      <AlertMessage class="col-completa" tipo="error" :mensaje="errorForm" @cerrar="errorForm = ''" />
      <label>
        Nombre del equipo
        <input v-model="nuevo.nombre" type="text" />
        <small v-if="enviado && errores.nombre" class="error-campo">{{ errores.nombre }}</small>
      </label>
      <label>
        Juego preferido
        <input v-model="nuevo.juegoPreferido" type="text" placeholder="Valorant, Rocket League..." />
        <small v-if="enviado && errores.juegoPreferido" class="error-campo">{{ errores.juegoPreferido }}</small>
      </label>
      <div class="col-completa">
        <button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Creando...' : 'Crear equipo' }}</button>
      </div>
    </form>

    <div class="filtros">
      <input v-model.trim="busqueda" type="search" placeholder="Buscar por nombre o capitán..." />
      <select v-model="juego">
        <option value="">Todos los juegos</option>
        <option v-for="j in juegos" :key="j" :value="j">{{ j }}</option>
      </select>
      <label class="check"><input v-model="soloMios" type="checkbox" /> Solo mis equipos</label>
    </div>

    <LoadingSpinner v-if="cargando" texto="Cargando equipos..." />
    <div v-else-if="error">
      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />
      <button class="btn btn-ghost" @click="cargar">Reintentar</button>
    </div>
    <EmptyState v-else-if="equiposFiltrados.length === 0" titulo="No se encontraron equipos" icono="👥">
      <p v-if="equipos.length" class="texto-suave">Prueba cambiando la búsqueda o los filtros.</p>
    </EmptyState>
    <div v-else class="grilla">
      <RouterLink
        v-for="equipo in equiposFiltrados"
        :key="equipo.id"
        :to="`/equipos/${equipo.id}`"
        class="tarjeta tarjeta-link"
        :style="{ '--color-estado': esMio(equipo) ? 'var(--senal)' : 'transparent' }"
      >
        <div class="tarjeta-cabecera">
          <TeamBadge :nombre="equipo.nombre" tamano="md" />
          <StatusBadge :estado="equipo.estado" />
        </div>
        <h3>{{ equipo.nombre }}</h3>
        <span class="juego">{{ equipo.juegoPreferido }}</span>
        <div class="tarjeta-pie">
          <span class="meta"><span>Capitán {{ equipo.capitan.alias }}</span><span>{{ equipo.integrantes.length }} integrante(s)</span></span>
          <span v-if="esMio(equipo)" class="badge badge-admin">Mi equipo</span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
