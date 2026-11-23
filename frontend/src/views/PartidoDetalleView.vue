<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import { ETIQUETAS, formatearFechaHora } from '../utils/formato';
import StatusBadge from '../components/StatusBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import TeamBadge from '../components/TeamBadge.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { esAdmin } = useAuth();

const partido = ref(null);
const cargando = ref(true);
const errorCarga = ref('');
const mensaje = ref({ tipo: 'exito', texto: '' });

async function cargar(conSpinner = true) {
  if (conSpinner) cargando.value = true;
  errorCarga.value = '';
  try {
    partido.value = await api(`/partidos/${props.id}`);
  } catch (e) {
    partido.value = null;
    errorCarga.value = e.status === 404 || e.status === 400 ? 'El partido solicitado no existe.' : e.message;
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);
watch(() => props.id, () => cargar());

const textoGanador = computed(() => {
  const r = partido.value?.resultado;
  if (!r) return '';
  return r.ganador ? `Ganador: ${r.ganador.nombre}` : 'Empate';
});

// ---------- Registrar / corregir resultado (ADMIN) ----------
const marcador = ref({ puntajeLocal: 0, puntajeVisitante: 0 });
const corrigiendo = ref(false);
const guardando = ref(false);

const errorMarcador = computed(() => {
  const { puntajeLocal, puntajeVisitante } = marcador.value;
  if (!Number.isInteger(puntajeLocal) || !Number.isInteger(puntajeVisitante)) return 'Los puntajes deben ser números enteros';
  if (puntajeLocal < 0 || puntajeVisitante < 0) return 'Los puntajes no pueden ser negativos';
  if (puntajeLocal === puntajeVisitante && partido.value?.torneo.modalidad === 'ELIMINACION') {
    return 'En eliminación directa no se permite empate';
  }
  return '';
});

function abrirCorreccion() {
  const r = partido.value.resultado;
  marcador.value = { puntajeLocal: r.puntajeLocal, puntajeVisitante: r.puntajeVisitante };
  corrigiendo.value = true;
}

async function guardarResultado() {
  if (errorMarcador.value) return (mensaje.value = { tipo: 'error', texto: errorMarcador.value });
  guardando.value = true;
  try {
    const metodo = partido.value.resultado ? 'PUT' : 'POST';
    await api(`/partidos/${props.id}/resultado`, { method: metodo, body: marcador.value });
    mensaje.value = { tipo: 'exito', texto: 'Resultado oficial guardado. El ranking del torneo se actualizó.' };
    corrigiendo.value = false;
    await cargar(false);
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  } finally {
    guardando.value = false;
  }
}

async function cancelarPartido() {
  try {
    await api(`/partidos/${props.id}`, { method: 'PATCH', body: { estado: 'CANCELADO' } });
    mensaje.value = { tipo: 'exito', texto: 'Partido cancelado' };
    await cargar(false);
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  }
}

// ---------- Confirmaciones ----------
const confirmacion = ref({ visible: false, titulo: '', mensaje: '', accion: null });
const procesando = ref(false);
async function confirmar() {
  procesando.value = true;
  try {
    await confirmacion.value.accion();
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  } finally {
    procesando.value = false;
    confirmacion.value.visible = false;
  }
}
function anularResultado() {
  confirmacion.value = {
    visible: true,
    titulo: '¿Anular resultado?',
    mensaje: 'El partido volverá a estado Programado y el ranking se recalculará.',
    accion: async () => {
      await api(`/partidos/${props.id}/resultado`, { method: 'DELETE' });
      mensaje.value = { tipo: 'exito', texto: 'Resultado anulado' };
      await cargar(false);
    },
  };
}
function eliminarPartido() {
  confirmacion.value = {
    visible: true,
    titulo: '¿Eliminar partido?',
    mensaje: 'Se eliminará el partido y su resultado, si lo tiene.',
    accion: async () => {
      const torneoId = partido.value.torneo.id;
      await api(`/partidos/${props.id}`, { method: 'DELETE' });
      router.push(`/torneos/${torneoId}`);
    },
  };
}
</script>

<template>
  <section>
    <RouterLink to="/partidos" class="volver">← Volver al calendario</RouterLink>
    <LoadingSpinner v-if="cargando" texto="Cargando partido..." />
    <EmptyState v-else-if="errorCarga" :titulo="errorCarga" icono="⚠️">
      <button class="btn btn-ghost" @click="cargar()">Reintentar</button>
    </EmptyState>

    <template v-else-if="partido">
      <span class="eyebrow">{{ partido.ronda }}</span>
      <p class="meta" style="margin: 0 0 1rem">
        <RouterLink :to="`/torneos/${partido.torneo.id}`">{{ partido.torneo.nombre }}</RouterLink>
        <span>{{ ETIQUETAS[partido.torneo.modalidad] }}</span>
      </p>

      <div class="tablero">
        <RouterLink
          :to="`/equipos/${partido.equipoLocal.id}`"
          class="tablero-equipo"
          :class="{ ganador: partido.resultado?.ganadorId === partido.equipoLocalId }"
        >
          <TeamBadge :nombre="partido.equipoLocal.nombre" tamano="xl" />
          <span class="nombre">{{ partido.equipoLocal.nombre }}</span>
          <small>Local</small>
        </RouterLink>
        <div class="tablero-centro">
          <div v-if="partido.resultado" class="puntaje">
            {{ partido.resultado.puntajeLocal }}<span>:</span>{{ partido.resultado.puntajeVisitante }}
          </div>
          <div v-else class="puntaje-vs">VS</div>
          <StatusBadge :estado="partido.estado" />
        </div>
        <RouterLink
          :to="`/equipos/${partido.equipoVisitante.id}`"
          class="tablero-equipo"
          :class="{ ganador: partido.resultado?.ganadorId === partido.equipoVisitanteId }"
        >
          <TeamBadge :nombre="partido.equipoVisitante.nombre" tamano="xl" />
          <span class="nombre">{{ partido.equipoVisitante.nombre }}</span>
          <small>Visitante</small>
        </RouterLink>
      </div>
      <div class="tablero-info">
        <span>{{ formatearFechaHora(partido.fechaHora) }}</span>
        <span v-if="partido.resultado"><strong>{{ textoGanador }}</strong></span>
        <span v-if="partido.resultado">Registrado por {{ partido.resultado.registradoPor?.alias }}</span>
      </div>

      <AlertMessage :tipo="mensaje.tipo" :mensaje="mensaje.texto" @cerrar="mensaje.texto = ''" />

      <div v-if="esAdmin" class="panel">
        <h2>Administración del partido</h2>
        <form
          v-if="partido.estado !== 'CANCELADO' && (!partido.resultado || corrigiendo)"
          class="form-linea"
          @submit.prevent="guardarResultado"
        >
          <label>{{ partido.equipoLocal.nombre }}
            <input v-model.number="marcador.puntajeLocal" type="number" min="0" />
          </label>
          <label>{{ partido.equipoVisitante.nombre }}
            <input v-model.number="marcador.puntajeVisitante" type="number" min="0" />
          </label>
          <button class="btn btn-primario" :disabled="guardando || Boolean(errorMarcador)">
            {{ guardando ? 'Guardando...' : partido.resultado ? 'Guardar corrección' : 'Registrar resultado oficial' }}
          </button>
          <button v-if="corrigiendo" type="button" class="btn btn-ghost" @click="corrigiendo = false">Cancelar</button>
        </form>
        <small v-if="errorMarcador && !partido.resultado" class="error-campo">{{ errorMarcador }}</small>

        <div class="acciones espacio-arriba">
          <button v-if="partido.resultado && !corrigiendo" class="btn btn-ghost" @click="abrirCorreccion">Corregir resultado</button>
          <button v-if="partido.resultado" class="btn btn-ghost" @click="anularResultado">Anular resultado</button>
          <button v-if="partido.estado === 'PROGRAMADO'" class="btn btn-ghost" @click="cancelarPartido">Cancelar partido</button>
          <button class="btn btn-peligro" @click="eliminarPartido">Eliminar partido</button>
        </div>
      </div>
    </template>

    <ConfirmDialog
      :visible="confirmacion.visible"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :procesando="procesando"
      texto-confirmar="Sí, continuar"
      @confirmar="confirmar"
      @cancelar="confirmacion.visible = false"
    />
  </section>
</template>
