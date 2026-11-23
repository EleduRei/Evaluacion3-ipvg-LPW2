-- =====================================================================
-- GameHub IPVG - Creación de la base de datos y de un usuario propio
-- Ejecutar UNA vez con un usuario administrador de MySQL (ej. root):
--   mysql -u root -p < database/crear_bd.sql
-- o abrir este archivo en MySQL Workbench y ejecutarlo.
--
-- Las TABLAS no se crean aquí: las crea TypeORM a partir de las entidades
-- (DB_SYNC=true) o el script "npm run seed" del backend.
-- La contraseña es solo para desarrollo local: cámbiela y use la misma en backend/.env
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gamehub_ipvg
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'gamehub'@'localhost' IDENTIFIED BY 'GameHubLocal2026';
GRANT ALL PRIVILEGES ON gamehub_ipvg.* TO 'gamehub'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Base de datos gamehub_ipvg y usuario gamehub listos' AS estado;
