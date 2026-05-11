// ====== CONFIGURACIÓN ======
const API_BASE = 'http://localhost/ParcialCorte3/backend/index.php';

// ====== ELEMENTOS DEL DOM ======
const navBtns = document.querySelectorAll('.nav-btn');
const secciones = document.querySelectorAll('.seccion');
const notificacion = document.getElementById('notificacion');

// Dashboard
const btnActualizarSaldo = document.getElementById('btnActualizarSaldo');
const saldoActual = document.getElementById('saldoActual');

// Registrar Gasto
const formularioGasto = document.getElementById('formularioGasto');
const inputUsuario = document.getElementById('usuario');
const inputProducto = document.getElementById('producto');
const inputMonto = document.getElementById('monto');
const inputNota = document.getElementById('nota');

// Historial
const btnFiltrar = document.getElementById('btnFiltrar');
const btnMostrarTodos = document.getElementById('btnMostrarTodos');
const filtroUsuario = document.getElementById('filtroUsuario');
const tablaGastos = document.getElementById('cuerpoTabla');

// Tamalbits
const btnObtenerTamalbits = document.getElementById('btnObtenerTamalbits');
const usuarioTamalbit = document.getElementById('usuarioTamalbit');
const tamalbitsTotal = document.getElementById('tamalbitsTotal');

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarGastos();
    actualizarSaldo();
    configurarNavegacion();
});

/**
 * Configurar navegación entre secciones
 */
function configurarNavegacion() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const seccionId = btn.getAttribute('data-seccion');
            mostrarSeccion(seccionId);

            // Actualizar botón activo
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Mostrar una sección específica
 */
function mostrarSeccion(id) {
    secciones.forEach(sec => sec.classList.remove('activa'));
    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.classList.add('activa');
        
        // Actualizar datos según la sección
        if (id === 'historial') cargarGastos();
        if (id === 'info') actualizarInfo();
    }
}

/**
 * Cargar productos desde backend
 */
async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE}?accion=productos`);
        const datos = await response.json();

        if (!datos.success) throw new Error(datos.error);

        // Llenar selector de productos
        inputProducto.innerHTML = '<option value="">-- Selecciona un producto --</option>';
        datos.productos.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.idProducto;
            option.textContent = `${prod.nombre} - $${parseFloat(prod.precio).toFixed(2)}`;
            inputProducto.appendChild(option);
        });

        // Mostrar tarjetas de productos
        const productosList = document.getElementById('productosList');
        productosList.innerHTML = '';
        datos.productos.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <h3>${prod.nombre}</h3>
                <div class="precio">$${parseFloat(prod.precio).toFixed(2)}</div>
                <div class="categoria">${prod.categoria}</div>
            `;
            productosList.appendChild(card);
        });

        // Llenar lista de productos en info
        const listaProductosInfo = document.getElementById('listaProductosInfo');
        listaProductosInfo.innerHTML = '';
        datos.productos.forEach(prod => {
            const li = document.createElement('li');
            li.textContent = `${prod.nombre} ($${parseFloat(prod.precio).toFixed(2)}) - ${prod.categoria}`;
            listaProductosInfo.appendChild(li);
        });

    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos', 'error');
    }
}

/**
 * Actualizar saldo desde API
 */
async function actualizarSaldo() {
    try {
        btnActualizarSaldo.disabled = true;
        btnActualizarSaldo.textContent = '⏳ Actualizando...';

        const response = await fetch(`${API_BASE}?accion=saldo`);
        const datos = await response.json();

        if (datos.error) throw new Error(datos.error);

        const saldo = parseFloat(datos.balance || 0);
        saldoActual.textContent = `$${saldo.toFixed(2)}`;

        // Actualizar dashboard
        const totalGastado = parseFloat(document.getElementById('totalGastos').textContent);
        const disponible = saldo - totalGastado;
        document.getElementById('saldoDisponibleDashboard').textContent = disponible.toFixed(2);

        mostrarNotificacion('✓ Saldo actualizado', 'success');

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al conectar con la API', 'error');
    } finally {
        btnActualizarSaldo.disabled = false;
        btnActualizarSaldo.textContent = '🔄 Actualizar Saldo';
    }
}

btnActualizarSaldo.addEventListener('click', actualizarSaldo);

/**
 * Registrar nuevo gasto
 */
async function registrarGasto(e) {
    e.preventDefault();

    const usuario = inputUsuario.value.trim();
    const idProducto = inputProducto.value;
    const monto = parseFloat(inputMonto.value);
    const nota = inputNota.value.trim();

    // Validar
    if (!usuario || !idProducto || monto <= 0) {
        mostrarNotificacion('Completa todos los campos requeridos', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}?accion=registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: usuario,
                idProducto: parseInt(idProducto),
                monto: monto,
                    descripcion: nota,
                    nota: nota
            })
        });

        const datos = await response.json();

        if (datos.error) {
            mostrarNotificacion(`❌ ${datos.error}`, 'error');
        } else if (datos.success) {
            mostrarNotificacion('✓ Gasto registrado exitosamente', 'success');
            formularioGasto.reset();
            cargarGastos();
            actualizarSaldo();
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al registrar gasto', 'error');
    }
}

formularioGasto.addEventListener('submit', registrarGasto);

/**
 * Cargar y mostrar gastos
 */
async function cargarGastos(usuario = null) {
    try {
        let url = `${API_BASE}?accion=gastos`;
        if (usuario) {
            url += `&usuario=${encodeURIComponent(usuario)}`;
        }

        const response = await fetch(url);
        const datos = await response.json();

        if (!datos.success) throw new Error(datos.error);

        mostrarGastosEnTabla(datos.gastos);
        calcularTotales(datos.gastos);

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar gastos', 'error');
    }
}

/**
 * Mostrar gastos en tabla
 */
function mostrarGastosEnTabla(gastos) {
    tablaGastos.innerHTML = '';

    if (gastos.length === 0) {
        tablaGastos.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay gastos registrados</td></tr>';
        return;
    }

    gastos.forEach(gasto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${gasto.idGasto}</td>
            <td>${gasto.usuario}</td>
            <td>${gasto.producto || '-'}</td>
            <td>${gasto.categoria || '-'}</td>
            <td>$${parseFloat(gasto.monto).toFixed(2)}</td>
            <td>${gasto.nota || '-'}</td>
            <td>${new Date(gasto.fechaRegistro).toLocaleDateString('es-ES')}</td>
        `;
        tablaGastos.appendChild(fila);
    });
}

/**
 * Calcular totales
 */
function calcularTotales(gastos) {
    const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    document.getElementById('totalGastos').textContent = total.toFixed(2);
    document.getElementById('totalGastadoDashboard').textContent = total.toFixed(2);
}

/**
 * Filtrar gastos por usuario
 */
async function filtrarGastos() {
    const usuario = filtroUsuario.value.trim();

    if (!usuario) {
        mostrarNotificacion('Ingresa un usuario para filtrar', 'warning');
        return;
    }

    await cargarGastos(usuario);
    mostrarNotificacion(`Filtrado por usuario: ${usuario}`, 'info');
}

btnFiltrar.addEventListener('click', filtrarGastos);
btnMostrarTodos.addEventListener('click', () => {
    filtroUsuario.value = '';
    cargarGastos();
    mostrarNotificacion('Mostrando todos los gastos', 'info');
});

/**
 * Obtener Tamalbits de usuario
 */
async function obtenerTamalbits() {
    const usuario = usuarioTamalbit.value.trim();

    if (!usuario) {
        mostrarNotificacion('Ingresa tu usuario', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}?accion=tamalbits&usuario=${encodeURIComponent(usuario)}`);
        const datos = await response.json();

        if (datos.error) {
            mostrarNotificacion(datos.error, 'error');
            return;
        }

        tamalbitsTotal.textContent = datos.tamalbits;
        document.getElementById('totalOrejasPollo').textContent = datos.totalGastado.toFixed(2);
        document.getElementById('resultadoTamalbits').style.display = 'block';

        mostrarNotificacion(`✓ ${usuario}: ${datos.tamalbits} Tamalbits`, 'success');

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al obtener Tamalbits', 'error');
    }
}

btnObtenerTamalbits.addEventListener('click', obtenerTamalbits);

/**
 * Actualizar información general
 */
async function actualizarInfo() {
    try {
        const response = await fetch(`${API_BASE}?accion=gastos`);
        const datos = await response.json();

        if (datos.success && datos.gastos.length > 0) {
            const total = datos.gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
            document.getElementById('totalGastosInfo').textContent = datos.gastos.length;
            document.getElementById('sumaTotalInfo').textContent = total.toFixed(2);
        }

    } catch (error) {
        console.error('Error actualizando info:', error);
    }
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion mostrar ${tipo}`;

    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 4000);
}
