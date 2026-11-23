// Cliente HTTP único de la aplicación: todas las llamadas a la API pasan por aquí.
// Usa fetch(), agrega el token JWT y transforma los errores en mensajes legibles.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function api(ruta, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('gh_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch solo falla aquí si no hay conexión (API apagada, red caída, CORS)
    throw new Error('No se pudo conectar con el servidor. Verifique que la API esté encendida.');
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Token vencido o inválido: se avisa a App.vue para cerrar la sesión
    if (respuesta.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('sesion-expirada'));
    }
    // NestJS devuelve { message: string | string[] } (ValidationPipe envía un arreglo)
    const mensaje = Array.isArray(datos?.message)
      ? datos.message.join('. ')
      : datos?.message ?? `Error ${respuesta.status}`;
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}
