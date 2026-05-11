# Parcial Corte 3 - Gestor de Gastos

Aplicación web para consultar saldo desde una API REST externa, registrar gastos en una base de datos local y calcular la moneda digital Tamalbit cuando se compran "Orejas de Pollo".

## Qué incluye

- Consulta de saldo en tiempo real desde la API bancaria.
- Registro de gastos con validación de saldo.
- Catálogo de productos cargado desde MySQL.
- Historial de gastos y cálculo automático de Tamalbits.
- Interfaz web en HTML, CSS y JavaScript con backend en PHP.

## Tecnologías

- HTML5, CSS3 y JavaScript
- PHP 8
- MySQL / MariaDB
- XAMPP
- API REST entregada por el profesor (`bank-service-1.0.0.jar`)

## Cómo ejecutar

1. Inicia Apache y MySQL en XAMPP.
2. Importa `database.sql` en MySQL.
3. Verifica que la API bancaria esté corriendo en `http://localhost:8083`.
4. Abre la aplicación en `http://localhost/ParcialCorte3/frontend/`.

## Estructura principal

- `frontend/`: interfaz web.
- `backend/`: lógica PHP y conexión con la API/BD.
- `database.sql`: esquema y datos base.

## Reglas clave

- El saldo no se modifica directamente desde la app.
- Los gastos se descuentan únicamente a través de la API bancaria.
- Cada $10 gastados en "Orejas de Pollo" generan 1 Tamalbit.

## Nota

La documentación completa del análisis, navegación y modelo entidad-relación está incluida por separado en el informe del proyecto.