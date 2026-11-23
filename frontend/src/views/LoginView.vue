<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import AlertMessage from '../components/AlertMessage.vue';
import AccesoHero from '../components/AccesoHero.vue';

const route = useRoute();
const router = useRouter();
const { login } = useAuth();

const correo = ref('');
const password = ref('');
const enviado = ref(false); // para mostrar errores solo después del primer intento
const cargando = ref(false);
const error = ref(route.query.expirada ? 'Su sesión expiró. Inicie sesión nuevamente.' : '');

// Validación en el cliente antes de enviar
const errores = computed(() => {
  const e = {};
  if (!correo.value) e.correo = 'Ingrese su correo';
  else if (!/^\S+@\S+\.\S+$/.test(correo.value)) e.correo = 'El correo no tiene un formato válido';
  if (!password.value) e.password = 'Ingrese su contraseña';
  return e;
});
const formularioValido = computed(() => Object.keys(errores.value).length === 0);

async function enviar() {
  enviado.value = true;
  error.value = '';
  if (!formularioValido.value) return;

  cargando.value = true;
  try {
    await login(correo.value.trim(), password.value);
    router.push(route.query.redirect || '/');
  } catch (e) {
    error.value = e.message; // ej: "Correo o contraseña incorrectos"
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="acceso">
    <AccesoHero />

    <section class="acceso-panel">
      <span class="eyebrow">Acceso</span>
      <h2>Iniciar sesión</h2>
      <p class="texto-suave">Ingresa con tu correo institucional.</p>

      <AlertMessage tipo="error" :mensaje="error" @cerrar="error = ''" />

      <form novalidate @submit.prevent="enviar">
        <label>
          Correo
          <input v-model="correo" type="email" autocomplete="username" placeholder="nombre@ipvg.cl" />
          <small v-if="enviado && errores.correo" class="error-campo">{{ errores.correo }}</small>
        </label>
        <label>
          Contraseña
          <input v-model="password" type="password" autocomplete="current-password" />
          <small v-if="enviado && errores.password" class="error-campo">{{ errores.password }}</small>
        </label>
        <button class="btn btn-primario btn-bloque" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>
      <p class="acceso-alterno">¿No tienes cuenta? <RouterLink to="/registro">Crear cuenta de estudiante</RouterLink></p>
    </section>
  </div>
</template>
