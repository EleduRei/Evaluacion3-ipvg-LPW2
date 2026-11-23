<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { useAuth } from './composables/useAuth';

const router = useRouter();
const { autenticado, logout } = useAuth();

// http.js emite este evento cuando la API responde 401 con un token guardado
function alExpirarSesion() {
  logout();
  router.push({ name: 'login', query: { expirada: '1' } });
}
onMounted(() => window.addEventListener('sesion-expirada', alExpirarSesion));
onUnmounted(() => window.removeEventListener('sesion-expirada', alExpirarSesion));
</script>

<template>
  <!-- Con sesión: barra lateral + contenido. Sin sesión: pantallas de acceso a ancho completo -->
  <div v-if="autenticado" class="shell">
    <NavBar />
    <div class="shell-cuerpo">
      <main class="contenido">
        <RouterView />
      </main>
      <footer class="pie">GameHub IPVG · Lenguaje de Programación Web II · IPVG Sede Chillán</footer>
    </div>
  </div>
  <RouterView v-else />
</template>
