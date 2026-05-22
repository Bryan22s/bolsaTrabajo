-- ================================================
-- Script de base de datos: Bolsa de Empleo
-- Programación 4 - EIF209
-- ================================================
-- INSTRUCCIONES:
-- 1. Abrir MySQL Workbench (o cliente de MySQL)
-- 2. Ejecutar este script completo
-- 3. Luego correr el backend (Spring Boot crea las tablas)
-- 4. Correr este script de nuevo para los datos de prueba
-- ================================================

CREATE DATABASE IF NOT EXISTS bolsaempleo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bolsaempleo;

-- ================================================
-- DATOS DE PRUEBA (insertar DESPUES de correr el
-- backend por primera vez, para que Hibernate cree
-- las tablas con ddl-auto=update)
-- ================================================

-- Empresas aprobadas para pruebas
INSERT IGNORE INTO empresa
    (cedula_juridica, nombre, localizacion, correo, telefono, descripcion, clave, aprobada, fecha_registro)
VALUES
    ('3-101-111111', 'SoftLab',
     'San José, Costa Rica',
     'softlab@correo.com', '2222-1111',
     'Empresa de desarrollo de software', 'pass123', true, NOW()),

    ('3-101-222222', 'Web Soft',
     'Heredia, Costa Rica',
     'websoft@correo.com', '2222-2222',
     'Soluciones web y móviles', 'pass123', true, NOW());

-- Características jerárquicas (como en el proyecto de referencia)
INSERT IGNORE INTO caracteristica (id, nombre, padre_id) VALUES
    (1,  'Bases de Datos',          NULL),
    (2,  'MySQL',                   1),
    (3,  'PostgreSQL',              1),
    (4,  'MongoDB',                 1),
    (5,  'Ciberseguridad',          NULL),
    (6,  'Lenguajes de programación', NULL),
    (7,  'C#',                      6),
    (8,  'Java',                    6),
    (9,  'Kotlin',                  6),
    (10, 'Python',                  6),
    (11, 'Tecnologías Web',         NULL),
    (12, 'HTML',                    11),
    (13, 'CSS',                     11),
    (14, 'JavaScript',              11),
    (15, 'React',                   11),
    (16, 'Testing',                 NULL),
    (17, 'Assertions',              16),
    (18, 'JUnit',                   17);

-- Puestos de prueba (similares a los de las imágenes de referencia)
INSERT IGNORE INTO puesto (id, empresa_cedula, descripcion, salario, tipo, activo, fecha_registro)
VALUES
    (1, '3-101-111111', 'Unity game developer',         1300000, 'PUBLICO', true, NOW() - INTERVAL 4 DAY),
    (2, '3-101-111111', 'Embedded software developer',  1500000, 'PUBLICO', true, NOW() - INTERVAL 3 DAY),
    (3, '3-101-222222', 'Full Stack Developer',         2000000, 'PUBLICO', true, NOW() - INTERVAL 2 DAY),
    (4, '3-101-222222', 'Frontend Developer',           1200000, 'PUBLICO', true, NOW() - INTERVAL 1 DAY);

-- Requisitos de los puestos
INSERT IGNORE INTO puesto_caracteristica (id, puesto_id, caracteristica_id, nivel)
VALUES
    (1, 3, 11, 3),   -- Full Stack: Tecnologías Web nivel 3
    (2, 3, 17, 4),   -- Full Stack: Assertions nivel 4
    (3, 4, 11, 3),   -- Frontend: Tecnologías Web nivel 3
    (4, 4, 17, 4),   -- Frontend: Assertions/JUnit/Testing nivel 4
    (5, 1, 6,  2),   -- Unity dev: Lenguajes de programación nivel 2
    (6, 2, 8,  3);   -- Embedded: Java nivel 3

SELECT 'Datos de prueba insertados correctamente' AS resultado;
