<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api/http';
import { useAuth } from '../composables/useAuth';
import { ETIQUETAS } from '../utils/formato';
import AlertMessage from '../components/AlertMessage.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import TeamBadge from '../components/TeamBadge.vue';

const { actualizarUsuario } = useAuth();

const perfil = ref(null);
const form = ref({ nombre: '', alias: '', password: '', confirmar: '' });
const cargando = ref(true);
const guardando = ref(false);
const enviado = ref(false);
const mensaje = ref({ tipo: 'exito', texto: '' });

async function cargar() {
  cargando.value = true;
  try {
    perfil.value = await api('/usuarios/perfil');
    form.value = { nombre: perfil.value.nombre, alias: perfil.value.alias, password: '', confirmar: '' };
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  } finally {
    cargando.value = false;
  }
}
onMounted(cargar);

const errores = computed(() => {
  const f = form.value;
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio';
  if (f.alias.trim().length < 3) e.alias = 'El alias debe tener al menos 3 caracteres';
  else if (!/^[A-Za-z0-9_.-]+$/.test(f.alias)) e.alias = 'Solo letras, números, punto, guion y guion bajo';
  if (f.password && f.password.length < 6) e.password = 'La nueva contraseña debe tener al menos 6 caracteres';
  if (f.password !== f.confirmar) e.confirmar = 'Las contraseñas no coinciden';
  return e;
});

async function guardar() {
  enviado.value = true;
  if (Object.keys(errores.value).length) return;
  guardando.value = true;
  try {
    const body = { nombre: form.value.nombre.trim(), alias: form.value.alias.trim() };
    if (form.value.password) body.password = form.value.password;
    perfil.value = await api('/usuarios/perfil', { method: 'PATCH', body });
    actualizarUsuario({ nombre: perfil.value.nombre, alias: perfil.value.alias });
    form.value.password = '';
    form.value.confirmar = '';
    enviado.value = false;
    mensaje.value = { tipo: 'exito', texto: 'Perfil actualizado correctamente' };
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: e.message };
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <section class="form-pagina">
    <LoadingSpinner v-if="cargando" />
    <template v-else-if="perfil">
      <header class="encabezado">
        <div class="hero-identidad">
          <TeamBadge :nombre="perfil.alias" tamano="lg" />
          <div>
            <span class="eyebrow">{{ ETIQUETAS[perfil.rol] }}</span>
            <h1>{{ perfil.alias }}</h1>
            <p>{{ perfil.nombre }} · {{ perfil.correo }}</p>
          </div>
        </div>
      </header>
      <AlertMessage :tipo="mensaje.tipo" :mensaje="mensaje.texto" @cerrar="mensaje.texto = ''" />

      <form class="form-grid panel" novalidate @submit.prevent="guardar">
        <label>
          Nombre
          <input v-model="form.nombre" type="text" />
          <small v-if="enviado && errores.nombre" class="error-campo">{{ errores.nombre }}</small>
        </label>
        <label>
          Alias
          <input v-model="form.alias" type="text" />
          <small v-if="enviado && errores.alias" class="error-campo">{{ errores.alias }}</small>
        </label>
        <label>
          Nueva contraseña (opcional)
          <input v-model="form.password" type="password" autocomplete="new-password" />
          <small v-if="enviado && errores.password" class="error-campo">{{ errores.password }}</small>
        </label>
        <label>
          Repetir nueva contraseña
          <input v-model="form.confirmar" type="password" autocomplete="new-password" />
          <small v-if="enviado && errores.confirmar" class="error-campo">{{ errores.confirmar }}</small>
        </label>
        <div class="col-completa">
          <button class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar cambios' }}</button>
        </div>
      </form>

      <h2>Mis equipos</h2>
      <p v-if="perfil.equipos.length === 0" class="texto-suave">
        Aún no perteneces a ningún equipo. <RouterLink to="/equipos">Crea uno</RouterLink>.
      </p>
      <ul v-else class="lista-simple">
        <li v-for="e in perfil.equipos" :key="e.id">
          <TeamBadge :nombre="e.nombre" tamano="sm" />
          <RouterLink :to="`/equipos/${e.id}`">{{ e.nombre }}</RouterLink>
          <span v-if="perfil.equiposCapitaneados.some((c) => c.id === e.id)" class="badge badge-admin">Capitán</span>
        </li>
      </ul>
    </template>
  </section>
</template>
