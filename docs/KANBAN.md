# Tablero Kanban — lista de tareas

Columnas del tablero (GitHub Projects o Trello): **Pendiente → En proceso → Terminado**.

Cada tarjeta debe tener: descripción concreta, **responsable**, y al cerrarse, el **commit o Pull Request** que la resolvió. Mover las tarjetas a medida que avanza el trabajo (no todas al final).

> Las tareas están agrupadas por funcionalidad completa (backend + frontend), como pide el enunciado: cada integrante debe trabajar en ambas capas. Completar la columna Responsable con la asignación real del equipo.

| # | Tarea | Capa | Responsable | Commit / PR |
|---|---|---|---|---|
| 1 | Crear repositorio, estructura `backend/` + `frontend/`, `.gitignore`, `.env.example` | Ambos | | |
| 2 | Configurar NestJS: TypeORM + MySQL, ConfigModule, CORS, ValidationPipe, Swagger | Backend | | |
| 3 | Entidades Usuario, Equipo, Torneo, Inscripcion, Partido, Resultado y relaciones | Backend | | |
| 4 | Auth: registro, login, JWT, `JwtAuthGuard`, `RolesGuard`, `@Roles` | Backend | | |
| 5 | Vue: proyecto Vite, router, `http.js`, `useAuth`, vistas Login y Registro, guard de navegación | Frontend | | |
| 6 | Perfil de usuario (API `/usuarios/perfil` + `PerfilView`) | Ambos | | |
| 7 | Equipos: CRUD, capitán, integrantes (API + `EquiposView` + `EquipoDetalleView`) | Ambos | | |
| 8 | Torneos: CRUD solo ADMIN + filtros (API + `TorneosView`, `TorneoFormView`, `FiltrosTorneos`) | Ambos | | |
| 9 | Inscripciones: reglas duplicado / cupo / cierre, aceptar-rechazar (API + pestaña en detalle de torneo) | Ambos | | |
| 10 | Partidos: programar entre equipos inscritos, calendario (API + `PartidosView`) | Ambos | | |
| 11 | Resultados oficiales y detalle de partido (API + `PartidoDetalleView`) | Ambos | | |
| 12 | Ranking calculado (`ranking.util.ts`, `GET /torneos/:id/ranking`, `RankingTable`) | Ambos | | |
| 13 | Componentes reutilizables: AlertMessage, ConfirmDialog, EmptyState, LoadingSpinner, StatusBadge | Frontend | | |
| 14 | Seed de datos de prueba + `crear_bd.sql` + `consultas_verificacion.sql` | Backend | | |
| 15 | Pruebas automáticas Jest (ranking, inscripciones, resultados, auth) | Backend | | |
| 16 | Pruebas manuales documentadas (`docs/PRUEBAS_MANUALES.md`) | Ambos | | |
| 17 | README completo, declaración de IA, aportes y bitácora | Ambos | | |
| 18 | Integración final en `main` mediante Pull Request y verificación de funcionamiento | Ambos | | |

## Bitácora (completar durante el trabajo)

| Fecha | Qué se planificó / cambió / qué problema apareció | Decisión tomada |
|---|---|---|
| | | |
