# GameHub IPVG 

Proyecto final de Lenguaje de Programación Web II (IPVG Chillán).

## ¿De qué se trata?

En el instituto los torneos de videojuegos se organizan "a la mala": por WhatsApp, planillas, etc. Así es difícil controlar los cupos, evitar que un equipo se inscriba dos veces y llevar el ranking al día.

GameHub es una página web para ordenar eso:
- Los **estudiantes** se registran, arman equipos, los inscriben en torneos y ven el calendario, los resultados y el ranking.
- El **administrador** crea los torneos, acepta o rechaza inscripciones, programa los partidos y registra los resultados. El ranking se calcula solo con esos resultados.

## Integrantes

| Nombre | Rama | GitHub |
|---|---|---|
| _(Eduardo Reinoso)_ | `rama-integrante-1` | _(eduardo.reinoso@virginiogomez.cl)_ |
| _(Felipe Jara)_ | `rama-integrante-2` | _(felipe.jara9@virginiogomez.cl)_ |

## Tecnologías

- **Frontend:** Vue 3 + Vite + Vue Router (las peticiones se hacen con `fetch`)
- **Backend:** NestJS
- **Base de datos:** MySQL con TypeORM
- **Otros:** Swagger para documentar la API y Jest para las pruebas

## Cómo está armado

```
Vue (puerto 5173)  →  fetch + token  →  API NestJS (puerto 3000)  →  MySQL
```

- `frontend/`: la página en Vue (vistas, componentes, rutas)
- `backend/`: la API. Cada parte (torneos, equipos, partidos, etc.) tiene su módulo con controller, service, DTO y entidad.
- `database/`: el script para crear la base de datos y consultas para revisarla
- `docs/`: pruebas manuales, tareas del Kanban y la guía de estudio

## Tablas y relaciones

- **usuarios**: nombre, alias, correo, contraseña (cifrada) y rol
- **equipos**: nombre, juego, capitán e integrantes (los integrantes van en la tabla `equipo_integrantes`)
- **torneos**: nombre, videojuego, modalidad (liga o eliminación), fechas, cupo y estado
- **inscripciones**: une un equipo con un torneo (pendiente / aceptada / rechazada)
- **partidos**: local, visitante, fecha, ronda y estado
- **resultados**: puntajes del partido y ganador (si queda vacío es empate)

Relaciones: Usuario → Equipo, Equipo ↔ Torneo (a través de Inscripción) y Torneo → Partido → Resultado.

## Roles

| Qué se puede hacer | Estudiante | Admin |
|---|:-:|:-:|
| Ver torneos, partidos y ranking | si | si |
| Crear equipo e inscribirlo (si es capitán) | si | si |
| Crear, editar y borrar torneos | no | si |
| Aceptar inscripciones y programar partidos | no | si |
| Registrar resultados | no | si |

Para protegerlo usamos un token (JWT) y dos guards: uno revisa que hayas iniciado sesión y el otro revisa tu rol.

## Reglas que cumple el sistema

- Un equipo no se puede inscribir dos veces en el mismo torneo.
- No se puede pasar del cupo máximo.
- Si ya cerró la inscripción, no se aceptan más equipos.
- Un partido tiene que ser entre dos equipos distintos inscritos en ese torneo.
- En eliminación directa no hay empates.
- El ranking no se escribe a mano: se calcula con los resultados (ganar 3 pts, empatar 1, perder 0).

## Cómo ejecutarlo

**Lo que se necesita:** Node.js y MySQL 8.

**1. Crear la base de datos** (pide la clave de root de MySQL):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/crear_bd.sql"
```

**2. Backend:**
```bash
cd backend
npm install
copy .env.example .env   # y completar los datos
npm run seed             # crea las tablas y carga datos de prueba
npm run start:dev        # queda en http://localhost:3000
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev              # queda en http://localhost:5173
```

**Cuentas de prueba:**
- Admin: `admin@ipvg.cl` / `Admin123!`
- Estudiante: `estudiante1@ipvg.cl` / `Estudiante123!` (también existen del 2 al 10)

## Variables del .env

`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `FRONTEND_URL`. Hay un ejemplo en `backend/.env.example`. El `.env` de verdad no se sube a GitHub.

## Endpoints principales

| Método | Ruta | Para qué |
|---|---|---|
| POST | `/auth/registro` y `/auth/login` | Crear cuenta / entrar (no piden token) |
| GET, PATCH | `/usuarios/perfil` | Ver y editar mi perfil |
| GET, POST, PATCH, DELETE | `/torneos` | Torneos (crear, editar y borrar es solo admin) |
| GET | `/torneos/:id/ranking` | Tabla de posiciones |
| GET, POST, PATCH, DELETE | `/equipos` | Equipos e integrantes |
| GET, POST, PATCH, DELETE | `/inscripciones` | Inscribir equipos; aceptar o rechazar (admin) |
| GET, POST, PATCH, DELETE | `/partidos` | Calendario; programar partidos (admin) |
| POST, PUT, DELETE | `/partidos/:id/resultado` | Resultados (admin) |

## Swagger

Con la API encendida, entrar a **http://localhost:3000/docs**.
1. Haz login en `POST /auth/login` y copia el `access_token`.
2. Aprieta **Authorize**, pega el token y ya puedes probar los endpoints protegidos.

## Kanban y reparto del trabajo

Tablero: _(pegar el link)_. Usamos las columnas Pendiente → En proceso → Terminado. La lista de tareas está en `docs/KANBAN.md`.

| Integrante | Qué hizo (front y back) |
|---|---|
| _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ |

## Pruebas

- **Automáticas:** con `npm test` dentro de `backend`. Son 19 pruebas (ranking, inscripciones, resultados y login) y pasan todas.
- **Manuales:** están en `docs/PRUEBAS_MANUALES.md`: login, roles, validaciones, filtros, ID que no existe, reglas de inscripción, reinicio de la API y qué pasa si la API está apagada.

## Problemas que tuvimos

- Las fechas salían un día antes por la zona horaria. Lo arreglamos armando la fecha en hora local (`utils/formato.js`).
- Los errores de validación llegaban como lista y se veían mal. Ahora se juntan en un solo mensaje (`api/http.js`).
- Cuando el token vencía, la app seguía "logueada". Ahora cierra la sesión sola y te manda al login.
- _(agregar los que tuvieron ustedes)_

## Uso de IA

| Herramienta | Para qué la usamos | En qué parte | Qué revisamos nosotros |
|---|---|---|---|
| Claude (Claude Code) | frontend , documentacion del readme | frontend (`frontend/src`), scripts SQL y este README.|
