-- =====================================================
-- TERO - Modulo de Eventos
-- Schema MySQL para integracion con sistema de costos
-- =====================================================

USE tero;

-- =====================================================
-- TABLAS DE EVENTOS
-- =====================================================

-- Menus predefinidos para eventos
CREATE TABLE IF NOT EXISTS menus_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'standard',  -- tapeo, asado, 3pasos, premium, brunch
    categorias JSON,  -- Array de categorias con items
    extras JSON,      -- Array de extras opcionales
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Eventos principales
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Info basica
    fecha DATE NOT NULL,
    cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    -- Horario
    turno VARCHAR(20) DEFAULT 'noche',  -- mediodia, noche
    hora_inicio TIME,
    hora_fin TIME,
    -- Clasificacion
    vendedor VARCHAR(100),
    tipo_evento VARCHAR(100),  -- cumpleanos, casamiento, corporativo, etc
    salon VARCHAR(100),
    -- Menu
    menu_id INT,
    menu_detalle JSON,  -- Detalle personalizado del menu
    -- Servicios adicionales
    tecnica BOOLEAN DEFAULT FALSE,
    dj BOOLEAN DEFAULT FALSE,
    tecnica_superior BOOLEAN DEFAULT FALSE,
    otros TEXT,
    -- Invitados y precios
    adultos INT DEFAULT 0,
    precio_adulto DECIMAL(12,2) DEFAULT 0,
    menores INT DEFAULT 0,
    precio_menor DECIMAL(12,2) DEFAULT 0,
    -- Extras (hasta 3 items adicionales)
    extra1_descripcion VARCHAR(255),
    extra1_valor DECIMAL(12,2),
    extra1_tipo VARCHAR(20) DEFAULT 'fijo',  -- fijo, por_persona
    extra2_descripcion VARCHAR(255),
    extra2_valor DECIMAL(12,2),
    extra2_tipo VARCHAR(20) DEFAULT 'fijo',
    extra3_descripcion VARCHAR(255),
    extra3_valor DECIMAL(12,2),
    extra3_tipo VARCHAR(20) DEFAULT 'fijo',
    -- Totales
    total_evento DECIMAL(12,2) DEFAULT 0,
    -- Estado
    confirmado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Foreign keys
    FOREIGN KEY (menu_id) REFERENCES menus_evento(id) ON DELETE SET NULL,
    -- Indices
    INDEX idx_eventos_fecha (fecha),
    INDEX idx_eventos_cliente (cliente),
    INDEX idx_eventos_confirmado (confirmado),
    INDEX idx_eventos_vendedor (vendedor)
) ENGINE=InnoDB;

-- Pagos de eventos
CREATE TABLE IF NOT EXISTS pagos_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    concepto VARCHAR(50) NOT NULL DEFAULT 'pago',  -- pago, sena, ajuste_ipc
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    INDEX idx_pagos_evento (evento_id),
    INDEX idx_pagos_fecha (fecha)
) ENGINE=InnoDB;

-- =====================================================
-- DATOS INICIALES - MENUS DE EJEMPLO
-- =====================================================

INSERT INTO menus_evento (nombre, tipo, categorias, extras) VALUES
(
    'Menu Tapeo Clasico',
    'tapeo',
    '[
        {"nombre": "Empanadas", "items": ["Carne", "Pollo", "JyQ", "Verdura"]},
        {"nombre": "Tabla de Fiambres", "items": ["Jamon crudo", "Bondiola", "Quesos variados"]},
        {"nombre": "Pizzetas", "items": ["Muzzarella", "Napolitana", "Fugazzeta"]},
        {"nombre": "Brochettes", "items": ["Pollo", "Cerdo", "Vegetales"]}
    ]',
    '["Bebidas sin alcohol", "Vino por mesa", "Postre individual"]'
),
(
    'Menu Asado Completo',
    'asado',
    '[
        {"nombre": "Entrada", "items": ["Empanadas surtidas", "Provoleta"]},
        {"nombre": "Parrilla", "items": ["Vacio", "Asado de tira", "Chorizo", "Morcilla", "Pollo"]},
        {"nombre": "Guarniciones", "items": ["Ensalada mixta", "Papas al horno"]}
    ]',
    '["Vino Malbec", "Flan con dulce de leche", "Cafe"]'
),
(
    'Menu Premium 3 Pasos',
    '3pasos',
    '[
        {"nombre": "Entrada", "items": ["Sopa crema de calabaza", "Bruschetta de tomate"]},
        {"nombre": "Principal", "items": ["Lomo al champignon", "Salmon rosado", "Risotto de hongos"]},
        {"nombre": "Postre", "items": ["Cheesecake", "Brownie con helado", "Frutas de estacion"]}
    ]',
    '["Champagne de bienvenida", "Vino reserva", "Mesa dulce"]'
)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- =====================================================
-- VISTAS UTILES
-- =====================================================

-- Vista de eventos con totales de pagos
CREATE OR REPLACE VIEW v_eventos_cobranzas AS
SELECT
    e.*,
    m.nombre as menu_nombre,
    COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as total_pagado,
    COALESCE(SUM(CASE WHEN p.concepto = 'sena' THEN p.monto ELSE 0 END), 0) as total_senas,
    COALESCE(SUM(CASE WHEN p.concepto = 'ajuste_ipc' THEN p.monto ELSE 0 END), 0) as ajuste_ipc,
    e.total_evento - COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as saldo_pendiente
FROM eventos e
LEFT JOIN menus_evento m ON e.menu_id = m.id
LEFT JOIN pagos_evento p ON p.evento_id = e.id
GROUP BY e.id;

-- Vista resumen mensual
CREATE OR REPLACE VIEW v_eventos_mensual AS
SELECT
    YEAR(fecha) as anio,
    MONTH(fecha) as mes,
    COUNT(*) as total_eventos,
    SUM(CASE WHEN confirmado = TRUE THEN 1 ELSE 0 END) as confirmados,
    SUM(adultos + menores) as total_invitados,
    SUM(total_evento) as facturacion_total
FROM eventos
GROUP BY YEAR(fecha), MONTH(fecha)
ORDER BY anio DESC, mes DESC;
