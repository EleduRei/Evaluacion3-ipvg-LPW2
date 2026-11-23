<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import StatusBadge from '../components/StatusBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import TeamBadge from '../components/TeamBadge.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { usuario, esAdmin } = useAuth();

const equipo = ref(null);
const usuarios = ref([]);
const cargando = ref(true);
const errorCarga = ref('');
const mensaje = ref({ tipo: 'exito', texto: '' });

async function cargar(conSpinner = true) {
  if (conSpinner) cargando.value = true;
  errorCarga.value = '';
  try {
    [equipo.value, usuarios.value] = await Promise.all([api(`/equipos/${props.id}`), api('/usuarios')]);
  } catch (e) {
    equipo.value = null;
    errorCarga.value = e.status === 404 || e.status === 400 ? 'El equipo solicitado no existe.' : e.message;
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);
watch(() => props.id, () => cargar());

// Solo el capitán o un administrador pueden gestionar el equipo
const puedeGestionar = computed(() => esAdmin.value || equipo.value?.capitanId === usuario.value?.id);
const candidatos = computed(() =>
  usuarios.value.filter((u) => u.activo && !equipo.value?.integrantes.some((i) => i.id === u.id)),
);

// ---------- Editar ----------
const editando = ref(false);
const edicion = ref({ nombre: '', juegoPreferido: '', estado: 'ACTIVO' });
function abrirEdicion() {
  edicion.value = { nombre: equipo.value.nombre, juegoPreferido: equipo.value.juegoPreferido, estado: equipo.value.estado };
  editando.value = true;
}
async function guardarEdicion() {
  if (edicion.value.nombre.trim().length < 3) return (mensaje.value = { tipo: 'error', texto: 'El nombre debe tener al menos 3 caracteres' });
  if (!edicion.value.juegoPreferido.trim()) return (mensaje.value = { tipo: 'error', texto: 'Indique el juego preferido' });
  try {
    equipo.value = await api(`/equipos/${props.id}`, { method: 'PATCH', body: edicion.value });
    editando.value = false;
    mensaje.value = { tipo: 'exito', texto: 'Equipo actualizado' };
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  }
}

// ---------- Integrantes ----------
const nuevoIntegrante = ref('');
async function agregarIntegrante() {
  if (!nuevoIntegrante.value) return (mensaje.value = { tipo: 'error', texto: 'Seleccione un usuario' });
  try {
    equipo.value = await api(`/equipos/${props.id}/integrantes`, {
      method: 'POST',
      body: { usuarioId: Number(nuevoIntegrante.value) },
    });
    nuevoIntegrante.value = '';
    mensaje.value = { tipo: 'exito', texto: 'Integrante agregado' };
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
function quitarIntegrante(integrante) {
  confirmacion.value = {
    visible: true,
    titulo: '¿Quitar integrante?',
    mensaje: `${integrante.alias} dejará de pertenecer a "${equipo.value.nombre}".`,
    accion: async () => {
      equipo.value = await api(`/equipos/${props.id}/integrantes/${integrante.id}`, { method: 'DELETE' });
      mensaje.value = { tipo: 'exito', texto: 'Integrante quitado' };
    },
  };
}
function eliminarEquipo() {
  confirmacion.value = {
    visible: true,
    titulo: '¿Eliminar equipo?',
    mensaje: `Se eliminará "${equipo.value.nombre}" y sus inscripciones. No se puede eliminar si ya tiene partidos.`,
    accion: async () => {
      await api(`/equipos/${props.id}`, { method: 'DELETE' });
      router.push('/equipos');
    },
  };
}
</script>

<template>
  <section>
    <RouterLink to="/equipos" class="volver">← Volver a equipos</RouterLink>
    <LoadingSpinner v-if="cargando" texto="Cargando equipo..." />
    <EmptyState v-else-if="errorCarga" :titulo="errorCarga" icono="⚠️">
      <button class="btn btn-ghost" @click="cargar()">Reintentar</button>
    </EmptyState>

    <template v-else-if="equipo">
      <div class="hero-detalle">
        <div class="hero-identidad">
          <TeamBadge :nombre="equipo.nombre" tamano="xl" />
          <div>
            <span class="eyebrow">{{ equipo.juegoPreferido }}</span>
            <h1>{{ equipo.nombre }}</h1>
            <StatusBadge :estado="equipo.estado" />
          </div>
        </div>
        <div v-if="puedeGestionar" class="acciones">
          <button class="btn btn-ghost" @click="abrirEdicion">Editar</button>
          <button class="btn btn-peligro" @click="eliminarEquipo">Eliminar</button>
        </div>
      </div>

      <AlertMessage :tipo="mensaje.tipo" :mensaje="mensaje.texto" @cerrar="mensaje.texto = ''" />

      <form v-if="editando" class="panel form-grid" @submit.prevent="guardarEdicion">
        <label>Nombre <input v-model="edicion.nombre" type="text" /></label>
        <label>Juego preferido <input v-model="edicion.juegoPreferido" type="text" /></label>
        <label>
          Estado
          <select v-model="edicion.estado">
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </label>
        <div class="col-completa acciones">
          <button class="btn btn-primario">Guardar</button>
          <button type="button" class="btn btn-ghost" @click="editando = false">Cancelar</button>
        </div>
      </form>

      <div class="dos-columnas espacio-arriba">
        <div class="panel">
          <h2>Integrantes ({{ equipo.integrantes.length }})</h2>
          <ul class="lista-simple">
            <li v-for="i in equipo.integrantes" :key="i.id">
              <TeamBadge :nombre="i.alias" tamano="sm" />
              <span><strong>{{ i.alias }}</strong> <small class="texto-suave">{{ i.nombre }}</small></span>
              <span v-if="i.id === equipo.capitanId" class="badge badge-admin">Capitán</span>
              <button
                v-else-if="puedeGestionar"
                class="btn btn-sm btn-peligro"
                @click="quitarIntegrante(i)"
              >Quitar</button>
            </li>
          </ul>
          <form v-if="puedeGestionar" class="form-linea" @submit.prevent="agregarIntegrante">
            <select v-model="nuevoIntegrante">
              <option value="">Agregar integrante...</option>
              <option v-for="u in candidatos" :key="u.id" :value="u.id">{{ u.alias }} · {{ u.nombre }}</option>
            </select>
            <button class="btn btn-primario" :disabled="!nuevoIntegrante">Agregar</button>
          </form>
        </div>

        <div class="panel">
          <h2>Torneos</h2>
          <p v-if="equipo.inscripciones.length === 0" class="texto-suave">El equipo no está inscrito en torneos.</p>
          <ul v-else class="lista-simple">
            <li v-for="insc in equipo.inscripciones" :key="insc.id">
              <RouterLink :to="`/torneos/${insc.torneo.id}`">{{ insc.torneo.nombre }}</RouterLink>
              <StatusBadge :estado="insc.estado" />
            </li>
          </ul>
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
