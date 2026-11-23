# Guía de estudio para la interrogación individual

La interrogación vale 70 puntos: 5 preguntas de 14 puntos, al menos una práctica sobre el repositorio. Para cada tema se indica **qué es**, **dónde está en el proyecto** y **por qué se hizo así**. Practica abriendo cada archivo y explicándolo en voz alta.

---

## 1. Flujo completo de una petición (muy probable)

Ejemplo: el capitán inscribe su equipo en un torneo.

1. `frontend/src/views/TorneoDetalleView.vue` → función `inscribir()` llama a `api('/inscripciones', { method: 'POST', body })`.
2. `frontend/src/api/http.js` hace `fetch()` agregando el header `Authorization: Bearer <token>` y convierte el body a JSON.
3. NestJS recibe la petición. `ValidationPipe` (configurado en `backend/src/main.ts`) valida el body contra `CrearInscripcionDto` (class-validator). Si falla → 400.
4. `JwtAuthGuard` verifica el token → si no hay o es inválido → 401. `RolesGuard` revisa `@Roles` (aquí no hay, cualquier usuario autenticado pasa).
5. `InscripcionesController.crear()` recibe el DTO y el usuario (`@UsuarioActual()`), y llama al service.
6. `InscripcionesService.crear()` aplica las reglas: torneo/equipo existen (404), es capitán (403), inscripción abierta (400), no duplicada (409), cupo (409). Luego `repository.save()`.
7. TypeORM genera el `INSERT` en la tabla `inscripciones` de MySQL.
8. La respuesta JSON vuelve al frontend; si hubo error, `http.js` lanza un `Error` con el mensaje de NestJS y la vista lo muestra en `AlertMessage`.

---

## 2. Vue / frontend

| Concepto | Dónde verlo | Qué decir |
|---|---|---|
| SPA + Vue Router | `src/router/index.js` | Una sola página; el router cambia el componente según la URL sin recargar. |
| Rutas dinámicas | `/torneos/:id`, `/equipos/:id`, `/partidos/:id` en `router/index.js` | `props: true` pasa `:id` como prop a la vista (`defineProps({ id })`). |
| Protección de navegación | `router.beforeEach` en `router/index.js` | Sin token → login; ruta con `meta.rol: 'ADMIN'` y usuario no admin → inicio. |
| Componentes reutilizables | `src/components/*` | `AlertMessage`, `ConfirmDialog`, `StatusBadge`, `TorneoCard`, `PartidoItem`, `RankingTable`, `EmptyState`, `LoadingSpinner`. |
| props | `TorneoCard.vue` (`torneo`), `StatusBadge.vue` (`estado`), `RankingTable.vue` (`filas`) | Datos que el padre entrega al hijo. Son de solo lectura en el hijo. |
| emit | `AlertMessage.vue` (`cerrar`), `ConfirmDialog.vue` (`confirmar`, `cancelar`), `FiltrosTorneos.vue` (`update:modelValue`) | El hijo avisa eventos al padre. |
| v-model | Todos los formularios (`LoginView`, `TorneoFormView`…); en un componente: `<FiltrosTorneos v-model="filtros">` | En el componente, v-model = prop `modelValue` + evento `update:modelValue`. Dentro se usa `computed` con `get/set`. |
| v-model modificadores | `v-model.number` (cupo, puntajes), `v-model.trim` (búsqueda) | Convierte a número / elimina espacios. |
| v-if / v-else-if / v-else | Vistas: cargando → error → vacío → datos (`TorneosView.vue`) | Crea o destruye el elemento según la condición. |
| v-show | Pestañas de `TorneoDetalleView.vue`, `ConfirmDialog.vue`, botón "Limpiar filtros" | Solo cambia `display`; conviene cuando se alterna seguido y se quiere conservar el estado del DOM. |
| v-for + :key | Listas de torneos, partidos, inscripciones, ranking | `:key` con el id permite a Vue identificar cada elemento al actualizar. |
| computed | `torneosFiltrados` en `TorneosView.vue`, `errores` de cada formulario, `inscripcionAbierta`, `equiposDisponibles` | Valor derivado que se recalcula solo cuando cambian sus dependencias (cacheado). |
| ref + onMounted | Todas las vistas: `const torneos = ref([])`, `onMounted(cargar)` | `ref` crea estado reactivo; `onMounted` carga datos cuando el componente ya está montado. |
| watch | `watch(() => props.id, ...)` en vistas de detalle | Si cambia el `:id` sin cambiar de vista, se recargan los datos. |
| fetch() | `src/api/http.js` | Un único cliente: agrega token, parsea JSON, traduce errores, detecta servidor caído. |
| Carga / éxito / error / vacío | `LoadingSpinner`, `AlertMessage`, `EmptyState` | Estados visibles en cada vista. |
| Estado de sesión | `src/composables/useAuth.js` | `ref` globales (fuera de la función) compartidos por toda la app + `localStorage`. |
| Validación de formularios | `computed errores` + `novalidate` + `@submit.prevent` | Se valida antes de enviar; el backend vuelve a validar (nunca confiar solo en el cliente). |
| Confirmación antes de eliminar | `ConfirmDialog.vue` usado en detalle de torneo, equipo y partido | Se pide confirmación y recién en `confirmar()` se hace el DELETE. |

---

## 3. NestJS / API REST

| Concepto | Dónde | Qué decir |
|---|---|---|
| Módulos | `*.module.ts`, unidos en `app.module.ts` | Agrupan controller + service + entidades de un recurso. |
| Controller | `*.controller.ts` | Define rutas y método HTTP (`@Get`, `@Post`, `@Patch`, `@Put`, `@Delete`), recibe `@Body`, `@Param`, `@Query`. No tiene lógica de negocio. |
| Service | `*.service.ts` | Lógica y reglas de negocio; usa repositorios. Se inyecta en el controller (inyección de dependencias). |
| DTO | `dto/*.dto.ts` | Define y valida la forma de los datos que llegan. `PartialType` hace opcionales los campos para el PATCH. |
| ValidationPipe | `main.ts` | `whitelist` quita campos extra, `forbidNonWhitelisted` responde 400 si llegan, `transform` convierte tipos. |
| ParseIntPipe | `@Param('id', ParseIntPipe)` | `/torneos/abc` → 400 en vez de error interno. |
| Excepciones | `NotFoundException` (404), `BadRequestException` (400), `ConflictException` (409), `ForbiddenException` (403), `UnauthorizedException` (401) | NestJS las transforma en respuestas JSON con `statusCode` y `message`. |
| CORS | `app.enableCors({ origin })` en `main.ts` | El navegador bloquea peticiones entre orígenes distintos (5173 → 3000) si el servidor no lo permite. |
| Variables de entorno | `ConfigModule.forRoot()` + `ConfigService` | Datos sensibles en `.env` (no se sube), plantilla en `.env.example`. |
| Códigos HTTP | 200 OK, 201 Created, 400, 401, 403, 404, 409 | 401 = no autenticado; 403 = autenticado pero sin permiso. |

---

## 4. MySQL / TypeORM

| Concepto | Dónde | Qué decir |
|---|---|---|
| Conexión | `TypeOrmModule.forRootAsync` en `app.module.ts` | Lee host/usuario/clave desde `.env`. `autoLoadEntities` registra las entidades. |
| Entidad | `*.entity.ts` con `@Entity`, `@Column`, `@PrimaryGeneratedColumn` | Clase que representa una tabla. |
| ManyToOne / OneToMany | `Equipo.capitan` ↔ `Usuario.equiposCapitaneados`; `Partido.torneo` ↔ `Torneo.partidos` | La FK queda en el lado ManyToOne (`@JoinColumn`). |
| ManyToMany | `Equipo.integrantes` ↔ `Usuario.equipos` con `@JoinTable('equipo_integrantes')` | Crea la tabla intermedia. |
| OneToOne | `Resultado.partido` ↔ `Partido.resultado` | La FK `partidoId` es única: un resultado por partido. |
| Unique compuesto | `@Unique(['torneoId','equipoId'])` en `Inscripcion` | Segunda barrera contra inscripción duplicada a nivel de BD. |
| Cascade | `onDelete: 'CASCADE'` en Inscripcion y Partido | Al borrar un torneo se borran sus inscripciones y partidos. |
| Repository | `@InjectRepository(Torneo) repo: Repository<Torneo>` | `find`, `findOne`, `save`, `update`, `remove`, `count`. |
| QueryBuilder | `TorneosService.listar` (filtros combinables) y `AuthService.login` (`addSelect('u.password')`) | Para consultas dinámicas; los parámetros `:q` evitan inyección SQL. |
| relations | `find({ relations: { equipoLocal: true, ... } })` | Carga las tablas relacionadas (JOIN). |
| synchronize | `DB_SYNC=true` | Crea/actualiza tablas desde las entidades. Solo en desarrollo (en producción se usan migraciones). |
| Seed | `src/seed/seed.ts` | Datos de prueba; `synchronize(true)` borra y recrea el esquema. |

---

## 5. Autenticación, roles, Swagger y pruebas

| Concepto | Dónde | Qué decir |
|---|---|---|
| Hash de contraseña | `bcrypt.hash` en `AuthService.registro`, `bcrypt.compare` en `login` | Nunca se guarda la contraseña en texto plano. |
| JWT | `jwtService.sign(payload)` en `AuthService` | Token firmado con `JWT_SECRET`; contiene `sub` (id), correo, alias y rol; expira según `JWT_EXPIRES_IN`. |
| Guard de autenticación | `auth/guards/jwt-auth.guard.ts` | Lee `Authorization: Bearer`, verifica el token y deja el usuario en `request.user`. |
| Guard de roles | `auth/guards/roles.guard.ts` + `@Roles(Rol.ADMIN)` | Usa `Reflector` para leer la metadata y compara con el rol del token. |
| Decorador propio | `@UsuarioActual()` | Entrega `request.user` al controller. |
| Swagger | `main.ts` (`DocumentBuilder`, `addBearerAuth`, `SwaggerModule.setup('docs')`) + `@ApiTags`, `@ApiOperation`, `@ApiProperty` | Documentación interactiva en `/docs`; botón Authorize para el token. |
| Pruebas automáticas | `*.spec.ts` con Jest | Se prueban services con **repositorios simulados** (`jest.fn()`, `getRepositoryToken`), sin tocar la BD. `ranking.util.ts` es función pura → prueba directa. |
| Pruebas manuales | `docs/PRUEBAS_MANUALES.md` | Casos con pasos, resultado esperado y obtenido. |

---

## 6. Git / GitHub / Kanban (preguntas típicas)

- **¿Para qué sirve una rama?** Desarrollar sin afectar `main`; `main` solo tiene versiones estables.
- **¿Qué es un Pull Request?** Solicitud para integrar una rama en `main`; permite revisar los cambios antes de unirlos.
- **¿Qué hace un buen commit?** Un cambio coherente y un mensaje que explica el avance (`feat: validar cupo máximo en inscripciones`).
- **Conflicto de merge:** dos ramas cambiaron las mismas líneas; se resuelve editando el archivo, eligiendo el contenido correcto y haciendo commit.
- **Kanban:** Pendiente → En proceso → Terminado; cada tarjeta con responsable y enlazada a commits/PR.
- Comandos: `git checkout -b rama`, `git add`, `git commit -m`, `git push -u origin rama`, `git pull`, `git merge`.

---

## 7. Preguntas prácticas probables (ensáyalas)

1. **"Agrega una regla: el cupo máximo no puede ser mayor a 32."** → `CrearTorneoDto`: cambiar `@Max(64)` por `@Max(32)` y el mensaje; en el frontend, la validación en `TorneoFormView.vue` (`errores`).
2. **"Cambia el puntaje del empate a 2 puntos."** → `PUNTOS.EMPATE` en `backend/src/torneos/ranking.util.ts` y actualizar la prueba en `ranking.util.spec.ts`.
3. **"¿Dónde se impide la inscripción duplicada?"** → `InscripcionesService.crear` (findOne + ConflictException) y `@Unique` en `inscripcion.entity.ts`.
4. **"Haz que solo el ADMIN pueda crear equipos."** → agregar `@Roles(Rol.ADMIN)` sobre `crear()` en `equipos.controller.ts` (el `RolesGuard` ya está en la clase).
5. **"Agrega un filtro por modalidad en Partidos."** → nuevo `ref('')`, un `<select v-model>` y una condición más en el `computed partidosFiltrados` de `PartidosView.vue`.
6. **"¿Qué pasa si apago la API y navego?"** → `fetch` lanza error, `http.js` lo convierte en "No se pudo conectar con el servidor" y la vista lo muestra con botón Reintentar.
7. **"¿Qué responde `GET /torneos/999`?"** → 404 `El torneo 999 no existe` (`TorneosService.obtener`); el frontend muestra "El torneo solicitado no existe."
8. **"¿Por qué el ganador no se envía desde el frontend?"** → lo calcula `ResultadosService.calcularGanador` para que siempre coincida con el marcador y validar el empate según la modalidad.
