<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/http';
import { aInputFechaHora } from '../utils/formato';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

// La misma vista sirve para crear (/torneos/nuevo) y editar (/torneos/:id/editar)
const props = defineProps({ id: { type: String, default: null } });
const router = useRouter();
const esEdicion = computed(() => Boolean(props.id));

const form = ref({
  nombre: '',
  videojuego: '',
  modalidad: 'LIGA',
  descripcion: '',
  fechaInicio: '',
  cierreInscripcion: '',
  cupoMaximo: 8,
  estado: 'ABIERTO',
});
const cargando = ref(false);
const guardando = ref(false);
const enviado = ref(false);
const error = ref('');

onMounted(async () => {
  if (!esEdicion.value) return;
  cargando.value = true;
  try {
    const t = await api(`/torneos/${props.id}`);
    form.value = {
      nombre: t.nombre,
      videojuego: t.videojuego,
      modalidad: t.modalidad,
      descripcion: t.descripcion ?? '',
      fechaInicio: t.fechaInicio,
      cierreInscripcion: aInputFechaHora(t.cierreInscripcion),
      cupoMaximo: t.cupoMaximo,
      estado: t.estado,
    };
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
});

// Validación previa al envío (mismas reglas que CrearTorneoDto)
const errores = computed(() => {
  const f = form.value;
  const e = {};
  if (f.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres';
  if (!f.videojuego.trim()) e.videojuego = 'Indique el videojuego';
  if (!f.fechaInicio) e.fechaInicio = 'Indique la fecha de inicio';
  if (!f.cierreInscripcion) e.cierreInscripcion = 'Indique el cierre de inscripción';
  else if (f.fechaInicio && new Date(f.cierreInscripcion) > new Date(`${f.fechaInicio}T23:59:59`)) {
    e.cierreInscripcion = 'El cierre debe ser anterior o igual a la fecha de inicio';
  }
  if (!Number.isInteger(f.cupoMaximo) || f.cupoMaximo < 2 || f.cupoMaximo > 64) {
    e.cupoMaximo = 'El cupo debe ser un número entero entre 2 y 64';
  }
  return e;
});

async function guardar() {
  enviado.value = true;
  error.value = '';
  if (Object.keys(errores.value).length) return;

  guardando.value = true;
  try {
    const datos = {
      ...form.value,
      nombre: form.value.nombre.trim(),
      videojuego: form.value.videojuego.trim(),
      descripcion: form.value.descripcion.trim() || undefined,
    };
    const torneo = esEdicion.value
      ? await api(`/torneos/${props.id}`, { method: 'PATCH', body: datos })
      : await api('/torneos', { method: 'POST', body: datos });
    router.push({ name: 'torneo-detalle', params: { id: torneo.id } });
  } catch (e) {
    error.value = e.message;
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <section class="form-pagina">
    <RouterLink :to="esEdicion ? `/torneos/${id}` : '/torneos'" class="volver">← Volver</RouterLink>
    <header class="encabezado">
      <div>
        <span class="eyebrow">Administración</span>
        <h1>{{ esEdicion ? 'Editar torneo' : 'Nuevo torneo' }}</h1>
        <p>El cupo y la fecha de cierre controlan las inscripciones de los equipos.</p>
      </div>
    </header>

    <LoadingSpinner v-if="cargando" />
    <template v-else>
      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />

      <form class="form-grid panel" novalidate @submit.prevent="guardar">
        <label class="col-completa">
          Nombre del torneo
          <input v-model="form.nombre" type="text" />
          <small v-if="enviado && errores.nombre" class="error-campo">{{ errores.nombre }}</small>
        </label>
        <label>
          Videojuego
          <input v-model="form.videojuego" type="text" placeholder="Valorant, Rocket League..." />
          <small v-if="enviado && errores.videojuego" class="error-campo">{{ errores.videojuego }}</small>
        </label>
        <label>
          Modalidad
          <select v-model="form.modalidad">
            <option value="LIGA">Liga (todos contra todos, permite empate)</option>
            <option value="ELIMINACION">Eliminación directa (sin empate)</option>
          </select>
        </label>
        <label>
          Fecha de inicio
          <input v-model="form.fechaInicio" type="date" />
          <small v-if="enviado && errores.fechaInicio" class="error-campo">{{ errores.fechaInicio }}</small>
        </label>
        <label>
          Cierre de inscripción
          <input v-model="form.cierreInscripcion" type="datetime-local" />
          <small v-if="enviado && errores.cierreInscripcion" class="error-campo">{{ errores.cierreInscripcion }}</small>
        </label>
        <label>
          Cupo máximo de equipos
          <input v-model.number="form.cupoMaximo" type="number" min="2" max="64" />
          <small v-if="enviado && errores.cupoMaximo" class="error-campo">{{ errores.cupoMaximo }}</small>
        </label>
        <label>
          Estado
          <select v-model="form.estado">
            <option value="ABIERTO">Inscripciones abiertas</option>
            <option value="EN_CURSO">En curso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </label>
        <label class="col-completa">
          Descripción (opcional)
          <textarea v-model="form.descripcion" rows="3"></textarea>
        </label>
        <div class="col-completa">
          <button class="btn btn-primario" :disabled="guardando">
            {{ guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear torneo' }}
          </button>
        </div>
      </form>
    </template>
  </section>
</template>
