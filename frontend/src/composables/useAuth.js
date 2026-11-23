import { computed, ref } from 'vue';
import { api } from '../api/http';

// Estado reactivo global de la sesión (se comparte entre todos los componentes
// porque las ref se crean una sola vez, fuera de la función useAuth).
const token = ref(localStorage.getItem('gh_token'));
const usuario = ref(leerUsuarioGuardado());

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem('gh_usuario'));
  } catch {
    return null;
  }
}

function guardarSesion(respuesta) {
  token.value = respuesta.access_token;
  usuario.value = respuesta.usuario;
  localStorage.setItem('gh_token', respuesta.access_token);
  localStorage.setItem('gh_usuario', JSON.stringify(respuesta.usuario));
}

export function useAuth() {
  const autenticado = computed(() => Boolean(token.value));
  const esAdmin = computed(() => usuario.value?.rol === 'ADMIN');

  async function login(correo, password) {
    guardarSesion(await api('/auth/login', { method: 'POST', body: { correo, password } }));
  }

  async function registro(datos) {
    guardarSesion(await api('/auth/registro', { method: 'POST', body: datos }));
  }

  function actualizarUsuario(datos) {
    usuario.value = { ...usuario.value, ...datos };
    localStorage.setItem('gh_usuario', JSON.stringify(usuario.value));
  }

  function logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_usuario');
  }

  return { token, usuario, autenticado, esAdmin, login, registro, actualizarUsuario, logout };
}
