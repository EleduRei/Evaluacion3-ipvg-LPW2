<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import { ETIQUETAS, formatearFecha, formatearFechaHora } from '../utils/formato';
import StatusBadge from '../components/StatusBadge.vue';
import RankingTable from '../components/RankingTable.vue';
import PartidoItem from '../components/PartidoItem.vue';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import TeamBadge from '../components/TeamBadge.vue';

// El parámetro dinámico :id llega como prop gracias a "props: true" en el router
const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { usuario, esAdmin } = useAuth();

const torneo = ref(null);
const partidos = ref([]);
const ranking = ref([]);
const equipos = ref([]);
const cargando = ref(true);
const errorCarga = ref('');
const mensaje = ref({ tipo: 'exito', texto: '' });
const pestana = ref('ranking');

async function cargar(conSpinner = true) {
  if (conSpinner) cargando.value = true;
  errorCarga.value = '';
  try {
    [torneo.value, partidos.value, ranking.value, equipos.value] = await Promise.all([
      api(`/torneos/${props.id}`),
      api(`/partidos?torneoId=${props.id}`),
      api(`/torneos/${props.id}/ranking`),
      api('/equipos'),
    ]);
  } catch (e) {
    torneo.value = null;
    errorCarga.value = e.status === 404 || e.status === 400 ? 'El torneo solicitado no existe.' : e.message;
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);
watch(() => props.id, () => cargar()); // si cambia el :id sin cambiar de vista

function avisar(tipo, texto) {
  mensaje.value = { tipo, texto };
}

// ---------- Datos derivados ----------
const inscripcionAbierta = computed(
  () => torneo.value?.estado === 'ABIERTO' && new Date() <= new Date(torneo.value.cierreInscripcion),
);
const equiposAceptados = computed(
  () => torneo.value?.inscripciones.filter((i) => i.estado === 'ACEPTADA').map((i) => i.equipo) ?? [],
);
// Equipos que el usuario puede inscribir: los que capitanea (o todos si es ADMIN) y que no estén inscritos
const equiposDisponibles = computed(() => {
  const yaInscritos = new Set(torneo.value?.inscripciones.map((i) => i.equipoId));
  return equipos.value.filter(
    (e) => (esAdmin.value || e.capitanId === usuario.value?.id) && !yaInscritos.has(e.id),
  );
});
// Últimos 5 resultados de cada equipo (G/E/P) para la columna "Forma" del ranking
const forma = computed(() => {
  const mapa = {};
  const jugados = partidos.value
    .filter((p) => p.resultado)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
  for (const p of jugados) {
    const { puntajeLocal: l, puntajeVisitante: v } = p.resultado;
    (mapa[p.equipoLocalId] ??= []).push(l > v ? 'G' : l < v ? 'P' : 'E');
    (mapa[p.equipoVisitanteId] ??= []).push(v > l ? 'G' : v < l ? 'P' : 'E');
  }
  for (const id in mapa) mapa[id] = mapa[id].slice(-5);
  return mapa;
});
const puedeRetirar = (inscripcion) => esAdmin.value || inscripcion.equipo.capitanId === usuario.value?.id;

// ---------- Inscripciones ----------
const equipoAInscribir = ref('');
const inscribiendo = ref(false);

async function inscribir() {
  if (!equipoAInscribir.value) return avisar('error', 'Seleccione un equipo para inscribir');
  inscribiendo.value = true;
  try {
    await api('/inscripciones', {
      method: 'POST',
      body: { torneoId: Number(props.id), equipoId: Number(equipoAInscribir.value) },
    });
    avisar('exito', 'Inscripción enviada. Queda pendiente de aprobación del administrador.');
    equipoAInscribir.value = '';
    await cargar(false);
  } catch (e) {
    avisar('error', e.message); // duplicada, cupo completo, inscripción cerrada...
  } finally {
    inscribiendo.value = false;
  }
}

async function cambiarEstado(inscripcion, estado) {
  try {
    await api(`/inscripciones/${inscripcion.id}/estado`, { method: 'PATCH', body: { estado } });
    avisar('exito', `Inscripción de "${inscripcion.equipo.nombre}" ${estado === 'ACEPTADA' ? 'aceptada' : 'rechazada'}`);
    await cargar(false);
  } catch (e) {
    avisar('error', e.message);
  }
}

// ---------- Programar partido (ADMIN) ----------
const nuevoPartido = ref({ equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' });
const intentoPartido = ref(false);
const guardandoPartido = ref(false);

const erroresPartido = computed(() => {
  const p = nuevoPartido.value;
  const e = {};
  if (!p.equipoLocalId) e.equipoLocalId = 'Seleccione el equipo local';
  if (!p.equipoVisitanteId) e.equipoVisitanteId = 'Seleccione el equipo visitante';
  else if (p.equipoLocalId === p.equipoVisitanteId) e.equipoVisitanteId = 'Debe ser distinto al equipo local';
  if (!p.fechaHora) e.fechaHora = 'Indique fecha y hora';
  if (!p.ronda.trim()) e.ronda = 'Indique la ronda (ej: Fecha 1, Semifinal)';
  return e;
});

async function programarPartido() {
  intentoPartido.value = true;
  if (Object.keys(erroresPartido.value).length) return;
  guardandoPartido.value = true;
  try {
    const p = nuevoPartido.value;
    await api('/partidos', {
      method: 'POST',
      body: {
        torneoId: Number(props.id),
        equipoLocalId: Number(p.equipoLocalId),
        equipoVisitanteId: Number(p.equipoVisitanteId),
        fechaHora: p.fechaHora,
        ronda: p.ronda.trim(),
      },
    });
    avisar('exito', 'Partido programado correctamente');
    nuevoPartido.value = { equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' };
    intentoPartido.value = false;
    await cargar(false);
  } catch (e) {
    avisar('error', e.message);
  } finally {
    guardandoPartido.value = false;
  }
}

// ---------- Confirmaciones (eliminar torneo / retirar inscripción) ----------
const confirmacion = ref({ visible: false, titulo: '', mensaje: '', accion: null });
const procesando = ref(false);

function pedirConfirmacion(titulo, texto, accion) {
  confirmacion.value = { visible: true, titulo, mensaje: texto, accion };
}
async function confirmar() {
  procesando.value = true;
  try {
    await confirmacion.value.accion();
  } catch (e) {
    avisar('error', e.message);
  } finally {
    procesando.value = false;
    confirmacion.value.visible = false;
  }
}

function eliminarTorneo() {
  pedirConfirmacion(
    '¿Eliminar torneo?',
    `Se eliminará "${torneo.value.nombre}" junto con sus inscripciones, partidos y resultados.`,
    async () => {
      await api(`/torneos/${props.id}`, { method: 'DELETE' });
      router.push({ name: 'torneos' });
    },
  );
}

function retirarInscripcion(inscripcion) {
  pedirConfirmacion(
    '¿Retirar inscripción?',
    `El equipo "${inscripcion.equipo.nombre}" dejará de participar en este torneo.`,
    async () => {
      await api(`/inscripciones/${inscripcion.id}`, { method: 'DELETE' });
      avisar('exito', 'Inscripción retirada');
      await cargar(false);
    },
  );
}
</script>

<template>
  <section>
    <RouterLink to="/torneos" class="volver">← Volver a torneos</RouterLink>

    <LoadingSpinner v-if="cargando" texto="Cargando torneo..." />

    <EmptyState v-else-if="errorCarga" :titulo="errorCarga" icono="⚠️">
      <button class="btn btn-ghost" @click="cargar()">Reintentar</button>
    </EmptyState>

    <template v-else-if="torneo">
      <div class="hero-detalle">
        <div>
          <span class="eyebrow">{{ torneo.videojuego }}</span>
          <h1>{{ torneo.nombre }}</h1>
          <StatusBadge :estado="torneo.estado" />
        </div>
        <div v-if="esAdmin" class="acciones">
          <RouterLink :to="`/torneos/${torneo.id}/editar`" class="btn btn-ghost">Editar</RouterLink>
          <button class="btn btn-peligro" @click="eliminarTorneo">Eliminar</button>
        </div>
      </div>

      <div class="datos">
        <div><small>Modalidad</small>{{ ETIQUETAS[torneo.modalidad] }}</div>
        <div><small>Inicio</small>{{ formatearFecha(torneo.fechaInicio) }}</div>
        <div><small>Cierre inscripción</small>{{ formatearFechaHora(torneo.cierreInscripcion) }}</div>
        <div><small>Cupo</small>{{ torneo.inscritos }} / {{ torneo.cupoMaximo }} equipos aceptados</div>
      </div>
      <p v-if="torneo.descripcion" class="descripcion">{{ torneo.descripcion }}</p>

      <AlertMessage :tipo="mensaje.tipo" :mensaje="mensaje.texto" @cerrar="mensaje.texto = ''" />

      <!-- Pestañas: v-show mantiene el contenido en el DOM y solo cambia su visibilidad -->
      <div class="pestanas" role="tablist">
        <button :class="{ activa: pestana === 'ranking' }" @click="pestana = 'ranking'">Ranking</button>
        <button :class="{ activa: pestana === 'partidos' }" @click="pestana = 'partidos'">
          Partidos<span>{{ partidos.length }}</span>
        </button>
        <button :class="{ activa: pestana === 'inscripciones' }" @click="pestana = 'inscripciones'">
          Inscripciones<span>{{ torneo.inscripciones.length }}</span>
        </button>
      </div>

      <!-- ===== Ranking ===== -->
      <div v-show="pestana === 'ranking'" class="panel-pestana">
        <RankingTable :filas="ranking" :forma="forma" />
      </div>

      <!-- ===== Inscripciones ===== -->
      <div v-show="pestana === 'inscripciones'" class="panel-pestana">
        <form v-if="inscripcionAbierta" class="form-linea" @submit.prevent="inscribir">
          <select v-model="equipoAInscribir" :disabled="equiposDisponibles.length === 0">
            <option value="">
              {{ equiposDisponibles.length ? 'Selecciona tu equipo...' : 'No tienes equipos disponibles para inscribir' }}
            </option>
            <option v-for="e in equiposDisponibles" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
          <button class="btn btn-primario" :disabled="inscribiendo || !equipoAInscribir">
            {{ inscribiendo ? 'Enviando...' : 'Inscribir equipo' }}
          </button>
        </form>
        <div v-else class="aviso-cerrado">🔒 El período de inscripción de este torneo está cerrado.</div>

        <p v-if="torneo.inscripciones.length === 0" class="texto-suave">Aún no hay equipos inscritos.</p>
        <ul v-else class="lista-simple">
          <li v-for="insc in torneo.inscripciones" :key="insc.id">
            <TeamBadge :nombre="insc.equipo.nombre" tamano="sm" />
            <RouterLink :to="`/equipos/${insc.equipo.id}`">{{ insc.equipo.nombre }}</RouterLink>
            <small class="texto-suave">{{ formatearFecha(insc.fecha) }}</small>
            <StatusBadge :estado="insc.estado" />
            <span class="acciones">
              <template v-if="esAdmin">
                <button v-if="insc.estado !== 'ACEPTADA'" class="btn btn-sm btn-ok" @click="cambiarEstado(insc, 'ACEPTADA')">Aceptar</button>
                <button v-if="insc.estado !== 'RECHAZADA'" class="btn btn-sm btn-ghost" @click="cambiarEstado(insc, 'RECHAZADA')">Rechazar</button>
              </template>
              <button v-if="puedeRetirar(insc)" class="btn btn-sm btn-peligro" @click="retirarInscripcion(insc)">Retirar</button>
            </span>
          </li>
        </ul>
      </div>

      <!-- ===== Partidos ===== -->
      <div v-show="pestana === 'partidos'" class="panel-pestana">
        <form v-if="esAdmin" class="form-grid panel" novalidate @submit.prevent="programarPartido">
          <h3 class="col-completa">Programar partido</h3>
          <label>
            Local
            <select v-model="nuevoPartido.equipoLocalId">
              <option value="">Seleccionar...</option>
              <option v-for="e in equiposAceptados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
            <small v-if="intentoPartido && erroresPartido.equipoLocalId" class="error-campo">{{ erroresPartido.equipoLocalId }}</small>
          </label>
          <label>
            Visitante
            <select v-model="nuevoPartido.equipoVisitanteId">
              <option value="">Seleccionar...</option>
              <option v-for="e in equiposAceptados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
            <small v-if="intentoPartido && erroresPartido.equipoVisitanteId" class="error-campo">{{ erroresPartido.equipoVisitanteId }}</small>
          </label>
          <label>
            Fecha y hora
            <input v-model="nuevoPartido.fechaHora" type="datetime-local" />
            <small v-if="intentoPartido && erroresPartido.fechaHora" class="error-campo">{{ erroresPartido.fechaHora }}</small>
          </label>
          <label>
            Ronda
            <input v-model="nuevoPartido.ronda" type="text" placeholder="Fecha 1, Semifinal..." />
            <small v-if="intentoPartido && erroresPartido.ronda" class="error-campo">{{ erroresPartido.ronda }}</small>
          </label>
          <div class="col-completa">
            <button class="btn btn-primario" :disabled="guardandoPartido || equiposAceptados.length < 2">
              {{ guardandoPartido ? 'Guardando...' : 'Programar partido' }}
            </button>
            <small v-if="equiposAceptados.length < 2" class="texto-suave"> Se necesitan al menos 2 equipos aceptados.</small>
          </div>
        </form>

        <div v-if="partidos.length" class="lista">
          <PartidoItem v-for="p in partidos" :key="p.id" :partido="p" />
        </div>
        <p v-else class="texto-suave">No hay partidos programados en este torneo.</p>
      </div>
    </template>

    <ConfirmDialog
      :visible="confirmacion.visible"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :procesando="procesando"
      @confirmar="confirmar"
      @cancelar="confirmacion.visible = false"
    />
  </section>
</template>
