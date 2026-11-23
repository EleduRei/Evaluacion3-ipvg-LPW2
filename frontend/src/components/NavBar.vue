<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { ETIQUETAS } from '../utils/formato';
import TeamBadge from './TeamBadge.vue';

const router = useRouter();
const { usuario, esAdmin, logout } = useAuth();

// Íconos SVG simples (trazos) para cada sección
const enlaces = [
  { to: '/', texto: 'Inicio', icono: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z' },
  { to: '/torneos', texto: 'Torneos', icono: 'M6 3h8v4a4 4 0 0 1-8 0zM6 5H3v1a3 3 0 0 0 3 3M14 5h3v1a3 3 0 0 1-3 3M10 11v3M7 17h6M8 14h4v3H8z' },
  { to: '/partidos', texto: 'Partidos', icono: 'M3 5h14v12H3zM3 9h14M7 3v4M13 3v4' },
  { to: '/equipos', texto: 'Equipos', icono: 'M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 17a5 5 0 0 1 10 0M14 9a2.5 2.5 0 1 0 0-5M14 12a4 4 0 0 1 4 5' },
  { to: '/perfil', texto: 'Mi perfil', icono: 'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 18a7 7 0 0 1 14 0' },
];

function salir() {
  logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="marca">
      <span class="marca-cuadro">GH</span>
      <span class="marca-texto">GameHub<small>IPVG · eSports</small></span>
    </RouterLink>

    <nav class="menu" aria-label="Navegación principal">
      <RouterLink
        v-for="enlace in enlaces"
        :key="enlace.to"
        :to="enlace.to"
        class="menu-item"
        :exact-active-class="enlace.to === '/' ? 'activo' : ''"
        :active-class="enlace.to === '/' ? '' : 'activo'"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
          <path :d="enlace.icono" />
        </svg>
        {{ enlace.texto }}
      </RouterLink>
    </nav>

    <div class="sesion">
      <TeamBadge :nombre="usuario?.alias ?? '?'" tamano="sm" />
      <div class="sesion-datos">
        <strong>{{ usuario?.alias }}</strong>
        <small :class="{ 'texto-senal': esAdmin }">{{ ETIQUETAS[usuario?.rol] }}</small>
      </div>
      <button class="btn-icono" title="Cerrar sesión" aria-label="Cerrar sesión" @click="salir">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M8 4H4v12h4M12 6l4 4-4 4M16 10H8" />
        </svg>
      </button>
    </div>
  </aside>
</template>
