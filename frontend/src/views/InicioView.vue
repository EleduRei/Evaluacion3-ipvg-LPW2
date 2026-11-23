<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import { formatearFechaHora, tiempoRelativo } from '../utils/formato';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import PartidoItem from '../components/PartidoItem.vue';
import TorneoCard from '../components/TorneoCard.vue';
import TeamBadge from '../components/TeamBadge.vue';

const route = useRoute();
const { usuario, esAdmin } = useAuth();

const torneos = ref([]);
const partidos = ref([]);
const equipos = ref([]);
const cargando = ref(true);
const error = ref('');
const aviso = ref(route.query.denegado ? 'No tiene permisos para acceder a esa sección.' : '');

const torneosAbiertos = computed(() => torneos.value.filter((t) => t.estado === 'ABIERTO'));
const torneosEnCurso = computed(() => torneos.value.filter((t) => t.estado === 'EN_CURSO'));
// La API devuelve los partidos ordenados por fecha: el primero es el más próximo
const proximo = computed(() => partidos.value[0] ?? null);
const siguientes = computed(() => partidos.value.slice(1, 5));
const misEquipos = computed(() =>
  equipos.value.filter((e) => e.integrantes.some((i) => i.id === usuario.value?.id)),
);

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    // Las tres peticiones se hacen en paralelo
    [torneos.value, partidos.value, equipos.value] = await Promise.all([
      api('/torneos'),
      api('/partidos?estado=PROGRAMADO'),
      api('/equipos'),
    ]);
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
        <span class="eyebrow">{{ esAdmin ? 'Panel de administración' : 'Panel del jugador' }}</span>
        <h1>Hola, {{ usuario?.alias }}</h1>
        <p>{{ esAdmin ? 'Gestiona torneos, inscripciones, partidos y resultados oficiales.' : 'Tus torneos, tus equipos y lo que se juega esta semana.' }}</p>
      </div>
      <RouterLink v-if="esAdmin" to="/torneos/nuevo" class="btn btn-primario">+ Nuevo torneo</RouterLink>
      <RouterLink v-else to="/equipos" class="btn btn-ghost">Mis equipos</RouterLink>
    </header>

    <AlertMessage tipo="info" :mensaje="aviso" @cerrar="aviso = ''" />

    <LoadingSpinner v-if="cargando" texto="Cargando resumen..." />
    <div v-else-if="error">
      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />
      <button class="btn btn-ghost" @click="cargar">Reintentar</button>
    </div>

    <template v-else>
      <div class="cifras">
        <div><b>{{ torneosAbiertos.length }}</b>Inscripción abierta</div>
        <div><b>{{ torneosEnCurso.length }}</b>Torneos en curso</div>
        <div><b>{{ partidos.length }}</b>Partidos por jugar</div>
        <div><b>{{ misEquipos.length }}</b>Mis equipos</div>
      </div>

      <div class="fila-titulo">
        <h2>Próximo partido</h2>
        <RouterLink to="/partidos" class="ver-todo">Calendario completo →</RouterLink>
      </div>
      <RouterLink v-if="proximo" :to="`/partidos/${proximo.id}`" class="destacado">
        <div class="lado lado-local">
          <span class="nombre">{{ proximo.equipoLocal.nombre }}</span>
          <TeamBadge :nombre="proximo.equipoLocal.nombre" tamano="lg" />
        </div>
        <div class="destacado-centro">
          <b>{{ tiempoRelativo(proximo.fechaHora) }}</b>
          <span>{{ formatearFechaHora(proximo.fechaHora) }} · {{ proximo.ronda }}</span>
          <div class="texto-suave nota">{{ proximo.torneo.nombre }}</div>
        </div>
        <div class="lado">
          <TeamBadge :nombre="proximo.equipoVisitante.nombre" tamano="lg" />
          <span class="nombre">{{ proximo.equipoVisitante.nombre }}</span>
        </div>
      </RouterLink>
      <EmptyState v-else titulo="No hay partidos programados" icono="📅" />

      <div v-if="siguientes.length" class="lista espacio-arriba">
        <PartidoItem v-for="p in siguientes" :key="p.id" :partido="p" mostrar-torneo />
      </div>

      <div class="fila-titulo">
        <h2>Inscripciones abiertas</h2>
        <RouterLink to="/torneos" class="ver-todo">Todos los torneos →</RouterLink>
      </div>
      <div v-if="torneosAbiertos.length" class="grilla">
        <TorneoCard v-for="t in torneosAbiertos" :key="t.id" :torneo="t" />
      </div>
      <EmptyState v-else titulo="No hay torneos con inscripción abierta" icono="🏆" />
    </template>
  </section>
</template>
