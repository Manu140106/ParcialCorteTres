# 📊 Parcial Corte 3 - Gestor de Gastos

**Aplicación web para gestión de gastos mediante API REST y moneda digital "Tamalbits"**

---

## 🎯 Descripción

Parcial es una aplicación integral de gestión de gastos que:
- ✅ Consulta saldo desde una API REST externa
- ✅ Registra gastos categorizados en una base de datos local
- ✅ Acumula "Tamalbits" (moneda digital) al gastar en "Orejas de Pollo"
- ✅ Proporciona un historial detallado de movimientos
- ✅ Opera sin requerir autenticación

**Fórmula Tamalbits:** 1 Tamalbit = $10 gastados en "Orejas de Pollo"

---

## 📋 Requisitos Previos

### Software
- **XAMPP** (Apache + MySQL + PHP)
- **HeidiSQL** (gestor de base de datos)
- **Java 8+** (para ejecutar el .jar de la API bancaria)
- **Navegador moderno** (Chrome, Firefox, Edge)

### Acceso a API
- Archivo `bank-service-1.0.0.jar` (proporcionado por el profesor)

---

## 🚀 Instalación y Configuración

### 1️⃣ Preparar Base de Datos

1. Abre **XAMPP Control Panel** e inicia **MySQL**
2. Abre **HeidiSQL**
3. Conéctate a tu servidor MySQL local
4. Abre el archivo `database.sql` desde ParcialCorte3
5. Ejecuta el script completo

**Se crearán:**
- ✅ Base de datos: `parcialCorte3`
- ✅ Tabla `productos` (6 productos de ejemplo)
- ✅ Tabla `gastos` (10 gastos de ejemplo)
- ✅ Tabla `tamalbits_usuarios` (para Tamalbits acumulados)

---

### 2️⃣ Configurar XAMPP

1. Inicia **Apache** en XAMPP Control Panel
2. Copia la carpeta `ParcialCorte3` a:
   ```
   C:\xampp\htdocs\ParcialCorte3
   ```

**Estructura esperada:**
```
C:\xampp\htdocs\ParcialCorte3\
├── backend/
│   ├── config.php
│   └── index.php
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── database.sql
```

---

### 3️⃣ Ejecutar la API REST

1. Abre **PowerShell** o **CMD**
2. Navega a la carpeta donde está el `.jar`:
   ```powershell
   cd C:\ruta\a\tu\jar
   ```
3. Ejecuta:
   ```powershell
   java -jar bank-service-1.0.0.jar
   ```
4. Verifica en: `http://localhost:8083/swagger-ui/index.html`

---

### 4️⃣ Acceder a la Aplicación

Abre en tu navegador:
```
http://localhost/ParcialCorte3/frontend/index.html
```

✅ **¡La aplicación está lista!**

---

## 📱 Secciones de la Aplicación

### 📊 Dashboard
- Muestra saldo actual obtenido desde la API
- Botón para actualizar saldo en tiempo real
- Información rápida (total gastado, disponible)

### 🍽️ Productos
- Catálogo visual de todos los productos disponibles
- Muestra nombre, precio y categoría
- Base para registrar gastos

### 📝 Registrar Gasto
- Formulario para crear nuevo gasto
- Campos: Usuario, Producto, Monto, Descripción opcional
- Validación automática de saldo
- Cálculo automático de Tamalbits

### 📋 Historial
- Tabla completa de gastos registrados
- Filtrado por usuario
- Ordenado por fecha descendente
- Muestra total acumulado

### 🏆 Tamalbits
- Consulta Tamalbits acumulados por usuario
- Solo cuenta gastos en "Orejas de Pollo"
- Fórmula: `floor(totalGastado / 10)`

### ℹ️ Información
- Guía de funcionamiento
- Reglas del sistema
- Catálogo de productos
- Estadísticas generales

---

## 💾 Base de Datos

### Tabla: `productos`
```sql
idProducto (PK) | nombre | categoria | descripcion | precio
```

**Productos de ejemplo:**
1. Orejas de Pollo - $35.00 - "Orejas de Pollo"
2. Tamal Clásico - $10.00 - "Tamales"
3. Tamal Verde - $12.00 - "Tamales"
4. Atole - $15.00 - "Bebidas"
5. Champurrado - $18.00 - "Bebidas"
6. Tamal Dulce - $14.00 - "Tamales"

### Tabla: `gastos`
```sql
idGasto (PK) | usuario | idProducto (FK) | monto | descripcion | fechaRegistro
```

### Tabla: `tamalbits_usuarios`
```sql
id (PK) | usuario | tamalbits
```

---

## 🔌 API Endpoints (Backend)

### GET - Obtener Productos
```
GET /backend/index.php?accion=productos
```
**Respuesta:**
```json
{
  "success": true,
  "productos": [
    { "idProducto": 1, "nombre": "Orejas de Pollo", "precio": "35.00", "categoria": "Orejas de Pollo" }
  ]
}
```

### GET - Obtener Gastos
```
GET /backend/index.php?accion=gastos
GET /backend/index.php?accion=gastos&usuario=Juan
```

### POST - Registrar Gasto
```
POST /backend/index.php?accion=registrar
Content-Type: application/json

{
  "usuario": "Juan",
  "idProducto": 1,
  "monto": 35.00,
   "descripcion": "Compra de Orejas de Pollo"
}
```

### GET - Obtener Saldo
```
GET /backend/index.php?accion=saldo
```
**Respuesta:**
```json
{ "balance": 500.00 }
```

### GET - Obtener Tamalbits
```
GET /backend/index.php?accion=tamalbits&usuario=Juan
```
**Respuesta:**
```json
{
  "success": true,
  "usuario": "Juan",
  "tamalbits": 3,
  "totalGastado": 35.00
}
```

---

## 🎨 Diseño y Colores

**Paleta de Colores:**
- 🟠 **Primario:** #D65A31 (Naranja)
- 🔵 **Secundario:** #2E86AB (Azul)
- 🟢 **Éxito:** #16A34A (Verde)
- 🔴 **Error:** #E02424 (Rojo)

**Características:**
- Diseño responsive (mobile-first)
- Interfaz intuitiva sin login requerido
- Tarjetas visuales con efectos hover
- Animaciones suaves
- Notificaciones de confirmación/error

---

## 🔒 Validaciones Importantes

✅ **El saldo nunca se modifica directamente** - Solo se descuenta al registrar gastos  
✅ **No puedes gastar más del saldo disponible** - Se valida en backend y frontend  
✅ **Tamalbits se calcula automáticamente** - Solo para "Orejas de Pollo"  
✅ **Validación en dos niveles** - Cliente (JavaScript) y servidor (PHP)  
✅ **Todo se almacena en la BD** - Historial permanente

---

## 🐛 Troubleshooting

### "Error al conectar con la API"
→ Verifica que el .jar esté corriendo en puerto 8083
→ Ejecuta `java -jar bank-service-1.0.0.jar` en PowerShell

### "Error en la consulta a BD"
→ Verifica que MySQL esté iniciado en XAMPP
→ Verifica que `database.sql` fue ejecutado completamente

### "404 - Backend no encontrado"
→ Verifica que Apache esté iniciado en XAMPP
→ Verifica la ruta: `http://localhost/ParcialCorte3/backend/index.php`

### "CORS error en consola"
→ Los headers CORS están configurados en `config.php`
→ Verifica que no haya bloqueadores de navegador

### "Tamalbits no se calculan"
→ Verifica que el producto sea "Orejas de Pollo" exactamente
→ El monto debe ser múltiplo de $10

---

## 📊 Flujo de Operaciones

```
1. Usuario accede a frontend
   ↓
2. Se cargan productos y saldo inicial
   ↓
3. Usuario registra gasto (formulario)
   ↓
4. Frontend envía POST al backend
   ↓
5. Backend valida datos
   ↓
6. Backend obtiene saldo de API (.jar)
   ↓
7. Backend verifica saldo suficiente
   ↓
8. Backend retira saldo de API
   ↓
9. Backend inserta gasto en BD
   ↓
10. Si es "Orejas de Pollo", calcula Tamalbits
    ↓
11. Respuesta JSON al frontend
    ↓
12. Frontend actualiza UI y muestra notificación
```

---

## 👥 Equipo

**Máximo 3 estudiantes por grupo**

Estructura sugerida:
- 1 estudiante: Frontend (HTML/CSS/JS)
- 1 estudiante: Backend (PHP/BD)
- 1 estudiante: Testing y documentación

---

## 📝 Checklist Pre-Entrega

- [ ] Base de datos ejecutada correctamente
- [ ] XAMPP iniciado (Apache + MySQL)
- [ ] .jar de API corriendo en puerto 8083
- [ ] Frontend accesible en `http://localhost/ParcialCorte3/frontend/index.html`
- [ ] Saldo se actualiza correctamente
- [ ] Se pueden registrar gastos
- [ ] Gastos aparecen en historial
- [ ] Tamalbits se calculan correctamente
- [ ] No hay errores en consola del navegador (F12)
- [ ] Código comentado y limpio
- [ ] README documentado

---

## 🚀 Comandos Útiles

**Iniciar todo:**
```powershell
# 1. Terminal 1 - Inicia la API
cd C:\ruta\a\jar
java -jar bank-service-1.0.0.jar

# 2. Terminal 2 - Inicia XAMPP (manual o comando)
C:\xampp\xampp_start.bat
```

**Verificar Acceso:**
```
http://localhost/phpmyadmin/              # BD
http://localhost:8083/swagger-ui/         # API
http://localhost/ParcialCorte3/frontend/  # App
```

---

## 📞 Soporte

Para errores comunes, revisa la consola del navegador (F12) para más detalles técnicos.

---

**¡Éxito con tu parcial! 🎉**
