-- =====================================================================
-- GameHub IPVG - Consultas SQL de verificación
-- Ejecutar en MySQL Workbench o:  mysql -u gamehub -p gamehub_ipvg
-- Sirven para comprobar la persistencia y las relaciones entre tablas.
-- =====================================================================
USE gamehub_ipvg;

-- 1. Tablas creadas por TypeORM
SHOW TABLES;

-- 2. Cantidad de registros por tabla (datos de prueba del seed)
SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM usuarios
UNION ALL SELECT 'equipos', COUNT(*) FROM equipos
UNION ALL SELECT 'equipo_integrantes', COUNT(*) FROM equipo_integrantes
UNION ALL SELECT 'torneos', COUNT(*) FROM torneos
UNION ALL SELECT 'inscripciones', COUNT(*) FROM inscripciones
UNION ALL SELECT 'partidos', COUNT(*) FROM partidos
UNION ALL SELECT 'resultados', COUNT(*) FROM resultados;

-- 3. Usuarios y rol (la contraseña se guarda cifrada con bcrypt)
SELECT id, nombre, alias, correo, rol, activo, LEFT(password, 7) AS inicio_hash FROM usuarios;

-- 4. Usuario -> Equipo: capitán e integrantes de cada equipo
SELECT e.nombre AS equipo, c.alias AS capitan,
       GROUP_CONCAT(u.alias ORDER BY u.alias SEPARATOR ', ') AS integrantes
FROM equipos e
JOIN usuarios c ON c.id = e.capitanId
JOIN equipo_integrantes ei ON ei.equipoId = e.id
JOIN usuarios u ON u.id = ei.usuarioId
GROUP BY e.id, e.nombre, c.alias;

-- 5. Equipo <-> Torneo mediante Inscripcion
SELECT t.nombre AS torneo, e.nombre AS equipo, i.estado, i.fecha
FROM inscripciones i
JOIN torneos t ON t.id = i.torneoId
JOIN equipos e ON e.id = i.equipoId
ORDER BY t.id, i.estado;

-- 6. Regla: no hay inscripciones duplicadas (debe devolver 0 filas)
SELECT torneoId, equipoId, COUNT(*) AS veces
FROM inscripciones GROUP BY torneoId, equipoId HAVING COUNT(*) > 1;

-- 7. Regla: ningún torneo supera su cupo (debe devolver 0 filas)
SELECT t.nombre, t.cupoMaximo, COUNT(i.id) AS activas
FROM torneos t JOIN inscripciones i ON i.torneoId = t.id AND i.estado IN ('PENDIENTE', 'ACEPTADA')
GROUP BY t.id, t.nombre, t.cupoMaximo HAVING COUNT(i.id) > t.cupoMaximo;

-- 8. Torneo -> Partido -> Resultado
SELECT t.nombre AS torneo, p.ronda, el.nombre AS local, r.puntajeLocal,
       r.puntajeVisitante, ev.nombre AS visitante, g.nombre AS ganador, p.estado
FROM partidos p
JOIN torneos t ON t.id = p.torneoId
JOIN equipos el ON el.id = p.equipoLocalId
JOIN equipos ev ON ev.id = p.equipoVisitanteId
LEFT JOIN resultados r ON r.partidoId = p.id
LEFT JOIN equipos g ON g.id = r.ganadorId
ORDER BY t.id, p.fechaHora;

-- 9. Regla: ningún partido enfrenta a un equipo consigo mismo (0 filas)
SELECT * FROM partidos WHERE equipoLocalId = equipoVisitanteId;

-- 10. Ranking calculado con SQL (debe coincidir con GET /torneos/1/ranking)
SELECT e.nombre AS equipo,
       COUNT(r.id) AS pj,
       SUM(r.ganadorId = e.id) AS pg,
       SUM(r.id IS NOT NULL AND r.ganadorId IS NULL) AS pe,
       SUM(r.ganadorId IS NOT NULL AND r.ganadorId <> e.id) AS pp,
       SUM(r.ganadorId = e.id) * 3 + SUM(r.id IS NOT NULL AND r.ganadorId IS NULL) AS puntos
FROM inscripciones i
JOIN equipos e ON e.id = i.equipoId
LEFT JOIN partidos p ON p.torneoId = i.torneoId AND (p.equipoLocalId = e.id OR p.equipoVisitanteId = e.id)
LEFT JOIN resultados r ON r.partidoId = p.id
WHERE i.torneoId = 1 AND i.estado = 'ACEPTADA'
GROUP BY e.id, e.nombre
ORDER BY puntos DESC;
