import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

// Las vistas se cargan bajo demanda (import dinámico) para aligerar la carga inicial.
const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { publica: true } },
  { path: '/registro', name: 'registro', component: () => import('../views/RegistroView.vue'), meta: { publica: true } },
  { path: '/', name: 'inicio', component: () => import('../views/InicioView.vue') },

  { path: '/torneos', name: 'torneos', component: () => import('../views/TorneosView.vue') },
  { path: '/torneos/nuevo', name: 'torneo-nuevo', component: () => import('../views/TorneoFormView.vue'), meta: { rol: 'ADMIN' } },
  // Rutas dinámicas: el parámetro :id llega al componente como prop
  { path: '/torneos/:id', name: 'torneo-detalle', component: () => import('../views/TorneoDetalleView.vue'), props: true },
  { path: '/torneos/:id/editar', name: 'torneo-editar', component: () => import('../views/TorneoFormView.vue'), props: true, meta: { rol: 'ADMIN' } },

  { path: '/equipos', name: 'equipos', component: () => import('../views/EquiposView.vue') },
  { path: '/equipos/:id', name: 'equipo-detalle', component: () => import('../views/EquipoDetalleView.vue'), props: true },

  { path: '/partidos', name: 'partidos', component: () => import('../views/PartidosView.vue') },
  { path: '/partidos/:id', name: 'partido-detalle', component: () => import('../views/PartidoDetalleView.vue'), props: true },

  { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue') },
  { path: '/:pathMatch(.*)*', name: 'no-encontrado', component: () => import('../views/NoEncontradoView.vue'), meta: { publica: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// Protección de navegación según el estado de autenticación y el rol
router.beforeEach((to) => {
  const { autenticado, usuario } = useAuth();

  if (!to.meta.publica && !autenticado.value) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if ((to.name === 'login' || to.name === 'registro') && autenticado.value) {
    return { name: 'inicio' };
  }
  if (to.meta.rol && usuario.value?.rol !== to.meta.rol) {
    return { name: 'inicio', query: { denegado: '1' } };
  }
});

export default router;
