DROP DATABASE IF EXISTS parcialCorte3;

CREATE DATABASE parcialCorte3;

USE parcialCorte3;

CREATE TABLE productos (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    emoji VARCHAR(10),
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gastos (
    idGasto INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    idProducto INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    descripcion VARCHAR(255),
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES productos(idProducto)
);

CREATE TABLE tamalbits_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    tamalbits INT NOT NULL DEFAULT 0,
    fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS v_tamalbits;

CREATE VIEW v_tamalbits AS
SELECT 
    g.usuario,
    COALESCE(FLOOR(SUM(g.monto) / 10), 0) AS tamalbits
FROM gastos g
INNER JOIN productos p ON g.idProducto = p.idProducto
WHERE p.categoria = 'Orejas de Pollo'
GROUP BY g.usuario;

INSERT INTO productos (nombre, precio, categoria, descripcion, emoji) VALUES 
('Orejas de Pollo', 35.00, 'Orejas de Pollo', 'Plato principal que otorga Tamalbits', '🍗'),
('Tamal Clásico', 10.00, 'Tamales', 'Tamal tradicional de la casa', '🌮'),
('Tamal Verde', 12.00, 'Tamales', 'Tamal con salsa verde', '🌮'),
('Atole', 15.00, 'Bebidas', 'Bebida caliente tradicional', '🥛'),
('Champurrado', 18.00, 'Bebidas', 'Atol de chocolate con masa', '☕'),
('Tamal Dulce', 14.00, 'Tamales', 'Tamal dulce para antojo', '🍰');

INSERT INTO gastos (usuario, idProducto, monto, descripcion) VALUES 
('Manuela', 1, 35.00, 'Compra de Orejas de Pollo para cena'),
('Mariana', 1, 70.00, 'Orden doble de Orejas de Pollo'),
('María', 2, 10.00, 'Tamal Clásico para desayuno'),
('Juan', 1, 35.00, 'Orejas de Pollo almuerzo'),
('José', 3, 12.00, 'Tamal Verde'),
('Pedro', 2, 10.00, 'Tamal Clásico'),
('Sofía', 1, 35.00, 'Orejas de Pollo'),
('Marta', 4, 15.00, 'Atole'),
('Valeria', 1, 70.00, 'Compra doble Orejas de Pollo'),
('Matías', 5, 18.00, 'Champurrado');