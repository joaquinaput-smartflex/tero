-- Seed initial admin user for Tero
-- Password: admin123 (CHANGE AFTER FIRST LOGIN!)

USE tero;

INSERT INTO users (username, email, password_hash, nombre, role, activo)
SELECT 'admin', 'admin@tero.local', '$2b$12$5CBhwN2VIih1pZGMzPeABuA8ORBT7UhELAu/4deq7J4DUzH.HcBQC', 'Administrador', 'admin', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Show created user
SELECT id, username, email, nombre, role, activo, created_at FROM users WHERE username = 'admin';
