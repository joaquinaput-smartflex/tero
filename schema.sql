-- =====================================================
-- TERO - Sistema de Gestión de Costos Gastronómicos
-- Schema para MySQL (compatible con el VPS smartflex-prod)
-- =====================================================

CREATE DATABASE IF NOT EXISTS tero CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tero;

-- =====================================================
-- TABLAS DE REFERENCIA
-- =====================================================

-- Categorías de insumos
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Datos iniciales de categorías
INSERT INTO categorias (nombre, orden) VALUES
    ('Carnes', 1),
    ('Almacen', 2),
    ('Verduras_Frutas', 3),
    ('Pescados_Mariscos', 4),
    ('Lacteos_Fiambres', 5),
    ('Bebidas', 6),
    ('Salsas_Subrecetas', 7)
ON DUPLICATE KEY UPDATE orden = VALUES(orden);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Secciones de carta
CREATE TABLE IF NOT EXISTS secciones_carta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INT DEFAULT 0
) ENGINE=InnoDB;

-- Datos iniciales de secciones
INSERT INTO secciones_carta (nombre, orden) VALUES
    ('Entradas', 1),
    ('Platos Principales', 2),
    ('Pastas y Ensaladas', 3),
    ('Postres', 4)
ON DUPLICATE KEY UPDATE orden = VALUES(orden);

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Insumos (ingredientes/materias primas)
CREATE TABLE IF NOT EXISTS insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    categoria_id INT,
    proveedor_id INT,
    unidad_medida VARCHAR(20) DEFAULT 'Kg',
    medida_compra VARCHAR(50),
    iva_porcentaje DECIMAL(5,2) DEFAULT 21.00,
    merma_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL,
    INDEX idx_insumos_categoria (categoria_id),
    INDEX idx_insumos_proveedor (proveedor_id)
) ENGINE=InnoDB;

-- Precios históricos de insumos
CREATE TABLE IF NOT EXISTS precios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    insumo_id INT NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    precio_unitario DECIMAL(12,2),
    costo_con_iva DECIMAL(12,2),
    costo_final DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE,
    INDEX idx_precios_insumo_fecha (insumo_id, fecha DESC)
) ENGINE=InnoDB;

-- Recetas
CREATE TABLE IF NOT EXISTS recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    es_subreceta BOOLEAN DEFAULT FALSE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_recetas_subreceta (es_subreceta)
) ENGINE=InnoDB;

-- Ingredientes de recetas
CREATE TABLE IF NOT EXISTS receta_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receta_id INT NOT NULL,
    insumo_id INT,
    subreceta_id INT,
    cantidad DECIMAL(10,4) NOT NULL,
    extra VARCHAR(100),
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE SET NULL,
    FOREIGN KEY (subreceta_id) REFERENCES recetas(id) ON DELETE SET NULL,
    INDEX idx_receta_ingredientes_receta (receta_id),
    INDEX idx_receta_ingredientes_insumo (insumo_id)
    -- Note: CHECK constraint for insumo_id XOR subreceta_id enforced at application level
) ENGINE=InnoDB;

-- Platos de carta
CREATE TABLE IF NOT EXISTS platos_carta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receta_id INT NOT NULL,
    seccion_id INT NOT NULL,
    numero INT,
    nombre_carta VARCHAR(200) NOT NULL,
    precio_carta DECIMAL(12,2) NOT NULL,
    margen_objetivo DECIMAL(5,4) DEFAULT 0.7500,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE RESTRICT,
    FOREIGN KEY (seccion_id) REFERENCES secciones_carta(id) ON DELETE RESTRICT,
    INDEX idx_platos_seccion (seccion_id),
    INDEX idx_platos_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de insumos con último precio
CREATE OR REPLACE VIEW v_insumos_precios AS
SELECT
    i.*,
    c.nombre as categoria_nombre,
    p.nombre as proveedor_nombre,
    pr.precio as ultimo_precio,
    pr.costo_final,
    pr.fecha as fecha_precio
FROM insumos i
LEFT JOIN categorias c ON i.categoria_id = c.id
LEFT JOIN proveedores p ON i.proveedor_id = p.id
LEFT JOIN (
    SELECT insumo_id, precio, costo_final, fecha,
           ROW_NUMBER() OVER (PARTITION BY insumo_id ORDER BY fecha DESC) as rn
    FROM precios
) pr ON pr.insumo_id = i.id AND pr.rn = 1;

-- =====================================================
-- USUARIO DE BASE DE DATOS
-- =====================================================

-- Crear usuario para la aplicación (ejecutar como root)
-- CREATE USER 'tero'@'%' IDENTIFIED BY 'CAMBIAR_PASSWORD';
-- GRANT ALL PRIVILEGES ON tero.* TO 'tero'@'%';
-- FLUSH PRIVILEGES;
