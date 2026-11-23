<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import AlertMessage from '../components/AlertMessage.vue';
import AccesoHero from '../components/AccesoHero.vue';

const router = useRouter();
const { registro } = useAuth();

const form = ref({ nombre: '', alias: '', correo: '', password: '', confirmar: '' });
const enviado = ref(false);
const cargando = ref(false);
const error = ref('');

// Mismas reglas que el RegistroDto del backend
const errores = computed(() => {
  const f = form.value;
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio';
  if (f.alias.trim().length < 3) e.alias = 'El alias debe tener al menos 3 caracteres';
  else if (!/^[A-Za-z0-9_.-]+$/.test(f.alias)) e.alias = 'Solo letras, números, punto, guion y guion bajo';
  if (!/^\S+@\S+\.\S+$/.test(f.correo)) e.correo = 'Ingrese un correo válido';
  if (f.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres';
  if (f.confirmar !== f.password) e.confirmar = 'Las contraseñas no coinciden';
  return e;
});

async function enviar() {
  enviado.value = true;
  error.value = '';
  if (Object.keys(errores.value).length) return;

  cargando.value = true;
  try {
    const { nombre, alias, correo, password } = form.value;
    await registro({ nombre: nombre.trim(), alias: alias.trim(), correo: correo.trim(), password });
    router.push('/');
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="acceso">
    <AccesoHero />

    <section class="acceso-panel">
      <span class="eyebrow">Nueva cuenta</span>
      <h2>Crear cuenta</h2>
      <p class="texto-suave">Las cuentas nuevas se crean con rol Estudiante.</p>

      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />

      <form novalidate @submit.prevent="enviar">
        <label>
          Nombre completo
          <input v-model="form.nombre" type="text" autocomplete="name" />
          <small v-if="enviado && errores.nombre" class="error-campo">{{ errores.nombre }}</small>
        </label>
        <label>
          Alias (nick de juego)
          <input v-model="form.alias" type="text" placeholder="ej: camiGG" />
          <small v-if="enviado && errores.alias" class="error-campo">{{ errores.alias }}</small>
        </label>
        <label>
          Correo
          <input v-model="form.correo" type="email" autocomplete="username" placeholder="nombre@ipvg.cl" />
          <small v-if="enviado && errores.correo" class="error-campo">{{ errores.correo }}</small>
        </label>
        <label>
          Contraseña
          <input v-model="form.password" type="password" autocomplete="new-password" />
          <small v-if="enviado && errores.password" class="error-campo">{{ errores.password }}</small>
        </label>
        <label>
          Repetir contraseña
          <input v-model="form.confirmar" type="password" autocomplete="new-password" />
          <small v-if="enviado && errores.confirmar" class="error-campo">{{ errores.confirmar }}</small>
        </label>
        <button class="btn btn-primario btn-bloque" :disabled="cargando">
          {{ cargando ? 'Creando cuenta...' : 'Registrarme' }}
        </button>
      </form>
      <p class="acceso-alterno">¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink></p>
    </section>
  </div>
</template>
