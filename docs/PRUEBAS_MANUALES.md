# Pruebas manuales documentadas

Entorno: API NestJS en `http://localhost:3000`, frontend Vue en `http://localhost:5173`, MySQL 8 local con los datos de `npm run seed`.
Las pruebas de API se ejecutaron desde Swagger o con peticiones HTTP; las de interfaz, desde el navegador.

> Fecha de ejecución: _(completar)_ · Ejecutado por: _(completar)_
> Recomendado: repetir los casos marcados 🖥️ en la app y adjuntar capturas en `docs/capturas/`.

## 1. Login, registro y roles

| ID | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| PM-01 | Login correcto | `POST /auth/login` admin@ipvg.cl / Admin123! | 200 con `access_token` y rol ADMIN | ✅ 200, rol ADMIN |
| PM-02 | Login incorrecto 🖥️ | Contraseña errónea | 401 "Correo o contraseña incorrectos"; la vista lo muestra | ✅ 401; la vista de login muestra el mensaje |
| PM-03 | Login con datos inválidos | correo "no-es-correo", clave vacía | 400 con mensajes de validación | ✅ 400 ["El correo no tiene un formato válido", "La contraseña es obligatoria"] |
| PM-04 | Registro | `POST /auth/registro` con datos válidos | 201, usuario con rol ESTUDIANTE | ✅ 201, rol ESTUDIANTE |
| PM-05 | Registro con correo repetido | Mismo correo de PM-04 | 409 | ✅ 409 "Ya existe una cuenta con ese correo" |
| PM-06 | Registro con datos inválidos | nombre vacío, alias "x", correo malo, clave "1" | 400 con cada error | ✅ 400 con 4 mensajes |
| PM-07 | Endpoint protegido sin token | `GET /torneos` sin header | 401 | ✅ 401 "Debe iniciar sesión (no se envió el token)" |
| PM-08 | Token inválido | `Authorization: Bearer token.falso` | 401 | ✅ 401 "Token inválido o expirado…" |
| PM-09 | Estudiante crea torneo | `POST /torneos` con token de estudiante | 403 | ✅ 403 "No tiene permisos para realizar esta acción" |
| PM-46 | Ruta de admin en el frontend 🖥️ | Estudiante abre `/torneos/nuevo` | Redirige al inicio con aviso de permisos | ✅ (guard `beforeEach`) |

## 2. Torneos, validaciones, búsqueda y filtros

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-10 | Admin crea torneo | 201 | ✅ 201 |
| PM-11 | Admin edita torneo (PATCH) | 200 con el cambio | ✅ 200 |
| PM-12 | Torneo con nombre corto, fecha inválida y cupo 1 | 400 con mensajes | ✅ 400 ["El nombre debe tener al menos 3 caracteres", "fechaInicio debe ser una fecha válida", "El cupo mínimo es de 2 equipos"] |
| PM-13 | Cierre de inscripción posterior al inicio | 400 | ✅ 400 |
| PM-14 | Body con propiedad extra | 400 (whitelist) | ✅ 400 "property campoExtra should not exist" |
| PM-15 | Búsqueda por texto `?q=copa` 🖥️ | Solo torneos que contienen "copa" | ✅ 1 resultado: "Copa IPVG Rocket League 2026" |
| PM-16 | Filtros combinados estado=ABIERTO + modalidad=ELIMINACION 🖥️ | Solo torneos que cumplen ambos | ✅ 2 resultados (Clásico Smash, Valorant Primavera) |

## 3. ID inexistente

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-17 | `GET /torneos/99999` 🖥️ | 404; el frontend informa | ✅ 404 "El torneo 99999 no existe"; la vista `/torneos/999` muestra "El torneo solicitado no existe." |
| PM-18 | `GET /partidos/99999` | 404 | ✅ 404 |
| PM-19 | `GET /torneos/abc` | 400 (ParseIntPipe) | ✅ 400 |

## 4. Equipos

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-20 | Estudiante crea equipo | 201 y queda como capitán | ✅ |
| PM-21 | Capitán agrega integrante | 201, 2 integrantes | ✅ |
| PM-22 | Otro estudiante edita el equipo | 403 | ✅ 403 "Solo el capitán del equipo o un administrador pueden modificarlo" |
| PM-41 | Eliminar equipo con partidos | 409 | ✅ 409 |
| PM-44 | Capitán elimina equipo sin partidos (con confirmación en la UI) | 200 | ✅ 200 |

## 5. Reglas de negocio: inscripciones

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-23 | Capitán inscribe su equipo | 201, estado PENDIENTE | ✅ |
| PM-24 | **Inscripción duplicada** | 409 | ✅ 409 "El equipo … ya está inscrito en este torneo" |
| PM-25 | Estudiante inscribe un equipo que no capitanea | 403 | ✅ 403 |
| PM-26 | **Cupo máximo** (torneo con cupo 2 ya lleno) | 409 | ✅ 409 "El torneo alcanzó su cupo máximo de 2 equipos" |
| PM-27 | **Inscripción cerrada** (torneo 1, cierre vencido) | 400 | ✅ 400 "El período de inscripción de este torneo está cerrado" |
| PM-28 | Admin acepta inscripción | 200, ACEPTADA | ✅ |

## 6. Partidos, resultados y ranking

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-29 | Partido con el mismo equipo de local y visita | 400 | ✅ 400 "Un partido debe enfrentar a dos equipos distintos" |
| PM-30 | Partido con un equipo no aceptado | 400 | ✅ 400 |
| PM-31 | Admin programa partido válido | 201 | ✅ |
| PM-32 | Estudiante programa partido | 403 | ✅ |
| PM-33 | Estudiante registra resultado | 403 | ✅ |
| PM-34 | **Resultado para partido inexistente** | 404 | ✅ 404 "El partido 99999 no existe" |
| PM-35 | Puntaje negativo | 400 | ✅ |
| PM-36 | **Registro de resultado** 2-1 | 201, ganador calculado = local | ✅ ganadorId = equipo local |
| PM-37 | Registrar dos veces el mismo partido | 409 | ✅ |
| PM-38 | Ranking se actualiza con el resultado | Ganador con 3 pts, 1 PG | ✅ |
| PM-39 | Empate en eliminación directa | 400 | ✅ 400 "En modalidad eliminación directa no se permite empate" |
| PM-40 | Ranking del torneo 1 (seed) 🖥️ | Ñuble 4, Chillanejos 3, Bit Bandits 2, Cordillera 1 | ✅ coincide (también con la consulta 10 de `consultas_verificacion.sql`) |
| PM-47 | Registrar resultado desde la UI 🖥️ | Partido 5: 3-0 → "Ganador: Ñuble Esports", estado Finalizado, mensaje de éxito | ✅ |
| PM-48 | Confirmación antes de anular/eliminar 🖥️ | Aparece diálogo "¿Anular resultado?"; Cancelar no ejecuta nada | ✅ |

## 7. Eliminación, perfil, persistencia y comunicación

| ID | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| PM-42 | Admin elimina torneo | 200 y cascada de inscripciones/partidos | ✅ |
| PM-43 | Consultar el torneo eliminado | 404 | ✅ |
| PM-45 | Editar perfil propio | 200 con el nuevo nombre | ✅ |
| PM-49 | **Persistencia tras reiniciar la API** | Detener y volver a iniciar la API; el resultado 3-0 del partido 5 y el usuario registrado siguen existiendo | ✅ "Ñuble Esports 3-0 Cordillera FC FINALIZADO"; 12 usuarios |
| PM-50 | **Error de comunicación con el backend** 🖥️ | Con la API detenida, abrir `/torneos` | ✅ Muestra "No se pudo conectar con el servidor. Verifique que la API esté encendida." y botón Reintentar |
| PM-51 | Swagger | Abrir `http://localhost:3000/docs` | ✅ 200; 18 rutas documentadas, con botón Authorize |

**Total: 51 casos, todos con el resultado esperado.**

## Pruebas automáticas (Jest)

```
PASS src/torneos/ranking.util.spec.ts
PASS src/inscripciones/inscripciones.service.spec.ts
PASS src/resultados/resultados.service.spec.ts
PASS src/auth/auth.service.spec.ts
Tests: 19 passed, 19 total
```
