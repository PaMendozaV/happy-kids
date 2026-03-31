// ===================================================================
//  auth.js  —  Happy Kids · Autenticación, Login, Registro, Dashboard
//  Depende de: carrito, actualizarCarritoCount, cargarPagina,
//              mostrarNotificacion  (todas definidas en main.js)
// ===================================================================

// ===== SESIÓN =====
function verificarSesion() {
    var usuario = localStorage.getItem('usuario');
    var loginLink = document.getElementById('loginLink');
    var dashboardLink = document.getElementById('dashboardLink');
    var logoutLink = document.getElementById('logoutLink');
    var adminLink = document.getElementById('adminLink');

    if (usuario) {
        var u = JSON.parse(usuario);
        if (loginLink) loginLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'inline-flex';
        if (logoutLink) logoutLink.style.display = 'inline-flex';

        // Mostrar link admin solo si es ADMIN
        if (adminLink) {
            adminLink.style.display = u.rol_nombre === 'ADMIN' ? 'inline-flex' : 'none';
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-flex';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    if (typeof carrito !== 'undefined') carrito = [];
    if (typeof actualizarCarritoCount !== 'undefined') actualizarCarritoCount();
    verificarSesion();
    if (typeof cargarPagina !== 'undefined') cargarPagina('inicio');
    if (typeof mostrarNotificacion !== 'undefined') mostrarNotificacion('👋 Sesión cerrada correctamente');
}

// ===== LOGIN / REGISTRO — pantalla unificada (igual al prototipo) =====
function mostrarLogin() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;

    c.innerHTML =
        '<section class="auth-page">' +
        '<div class="container">' +
        '<div class="auth-grid">' +

        // ── Columna izquierda: INICIAR SESIÓN ──
        '<div class="auth-col left">' +
        '<h2>Iniciar Sesión</h2>' +
        '<form onsubmit="event.preventDefault(); _doLogin()">' +
        '<div class="form-group"><label>Email o nombre de usuario</label>' +
        '<input type="email" id="loginEmail" placeholder="correo@ejemplo.com" required></div>' +
        '<div class="form-group"><label>Contraseña</label>' +
        '<input type="password" id="loginPassword" placeholder="Tu contraseña" required></div>' +
        '<button type="submit" class="btn-login">Log In</button>' +
        '</form>' +
        '<div class="auth-extra-links">' +
        '<a href="#">¿Olvidaste tu contraseña? Recuperar</a>' +
        '</div>' +
        '<div class="auth-divider">o</div>' +
        '<button class="btn-admin" onclick="_loginAdmin()">Iniciar como administrador autorizado</button>' +
        '</div>' +

        // ── Columna derecha: CREAR CUENTA ──
        '<div class="auth-col right">' +
        '<h2>Crear Cuenta</h2>' +
        '<form onsubmit="event.preventDefault(); _doRegistro()">' +
        '<div class="form-group"><label>Email</label>' +
        '<input type="email" id="regEmail" placeholder="correo@ejemplo.com" required></div>' +
        '<div class="form-group"><label>Nombre de usuario</label>' +
        '<input type="text" id="regNombre" placeholder="Tu nombre completo" required></div>' +
        '<div class="form-group"><label>Contraseña</label>' +
        '<input type="password" id="regPassword" placeholder="Mínimo 6 caracteres" required></div>' +
        '<div class="form-group"><label>Verificar Contraseña</label>' +
        '<input type="password" id="regConfirm" placeholder="Repite tu contraseña" required></div>' +
        '<div class="form-group"><label>Número de teléfono</label>' +
        '<input type="tel" id="regTelefono" placeholder="Número de contacto" required></div>' +
        '<button type="submit" class="btn-registro">Registrar</button>' +
        '</form>' +
        '</div>' +

        '</div></div></section>';
}

// mostrarRegistro apunta a la misma pantalla
function mostrarRegistro() { mostrarLogin(); }

// ===== INICIAR SESIÓN =====
function _doLogin() {
    var email    = (document.getElementById('loginEmail')    || {}).value || '';
    var password = (document.getElementById('loginPassword') || {}).value || '';

    if (!email || !password) { 
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('Por favor completa todos los campos', 'error');
        }
        return; 
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(function (r) { return r.json(); })
    .then(function (result) {
        if (result.success) {
            localStorage.setItem('usuario', JSON.stringify(result.usuario));
            localStorage.setItem('token', 'hk-' + Date.now());
            
            // Depuración: verificar rol en consola
            console.log('✅ Login exitoso:', result.usuario);
            console.log('🎭 Rol del usuario:', result.usuario.rol_nombre);
            
            verificarSesion();
            
            if (typeof mostrarNotificacion !== 'undefined') {
                mostrarNotificacion('✅ ¡Bienvenido ' + (result.usuario.nombre_cliente || result.usuario.correo_usuario || 'usuario') + '!');
            }
            
            // ===== REDIRECCIÓN SEGÚN ROL =====
            if (result.usuario.rol_nombre === 'ADMIN') {
                console.log('🔐 Redirigiendo a panel de administración...');
                window.location.href = '/admin.html';
            } else {
                console.log('👤 Redirigiendo a dashboard de cliente...');
                if (typeof cargarPagina !== 'undefined') {
                    cargarPagina('dashboard');
                }
            }
        } else {
            if (typeof mostrarNotificacion !== 'undefined') {
                mostrarNotificacion('❌ Correo o contraseña incorrectos', 'error');
            }
        }
    })
    .catch(function (error) { 
        console.error('Error en login:', error);
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('❌ Error al conectar con el servidor', 'error');
        }
    });
}

function _loginAdmin() {
    var emailEl = document.getElementById('loginEmail');
    var passEl  = document.getElementById('loginPassword');
    if (emailEl) emailEl.value = 'san.cvelandia@gmail.com';
    if (passEl)  { 
        passEl.value = ''; 
        passEl.focus(); 
    }
    if (typeof mostrarNotificacion !== 'undefined') {
        mostrarNotificacion('Ingresa la contraseña de administrador');
    }
}

// ===== REGISTRAR USUARIO =====
function _doRegistro() {
    var email    = (document.getElementById('regEmail')    || {}).value || '';
    var nombre   = (document.getElementById('regNombre')   || {}).value || '';
    var password = (document.getElementById('regPassword') || {}).value || '';
    var confirm  = (document.getElementById('regConfirm')  || {}).value || '';
    var telefono = (document.getElementById('regTelefono') || {}).value || '';

    if (!email || !nombre || !password || !telefono) { 
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('Por favor completa todos los campos', 'error');
        }
        return; 
    }
    if (password !== confirm)  { 
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
        }
        return; 
    }
    if (password.length < 6)   { 
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        }
        return; 
    }

    fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, telefono: telefono, email: email, password: password })
    })
    .then(function (r) { return r.json(); })
    .then(function (result) {
        if (result.success) {
            if (typeof mostrarNotificacion !== 'undefined') {
                mostrarNotificacion('✅ ¡Registro exitoso! Ahora inicia sesión');
            }
            ['regEmail','regNombre','regPassword','regConfirm','regTelefono'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.value = '';
            });
            var emailEl = document.getElementById('loginEmail');
            if (emailEl) emailEl.focus();
        } else {
            if (typeof mostrarNotificacion !== 'undefined') {
                mostrarNotificacion('❌ ' + (result.error || 'Error al registrar'), 'error');
            }
        }
    })
    .catch(function (error) { 
        console.error('Error en registro:', error);
        if (typeof mostrarNotificacion !== 'undefined') {
            mostrarNotificacion('❌ Error al conectar con el servidor', 'error');
        }
    });
}

// ===== DASHBOARD =====
function mostrarDashboard() {
    var raw = localStorage.getItem('usuario');
    if (!raw) { 
        if (typeof cargarPagina !== 'undefined') cargarPagina('login'); 
        return; 
    }
    var usuario = JSON.parse(raw);
    if (!usuario || !usuario.usuario_id) { 
        if (typeof cargarPagina !== 'undefined') cargarPagina('login'); 
        return; 
    }

    var c = document.getElementById('contenido-principal');
    if (!c) return;

    var nombre = usuario.nombre_cliente || usuario.correo_usuario || 'Usuario';
    var rol    = usuario.rol_nombre === 'ADMIN' ? '🔑 Administrador' : '🛍️ Cliente';

    c.innerHTML =
        '<section class="dashboard-page"><div class="container">' +
        '<div class="dashboard-header">' +
        '<h2>👤 ¡Hola, ' + _escAuth(nombre) + '!</h2>' +
        '<p>Bienvenido a tu panel de Happy Kids · ' + rol + '</p>' +
        '</div>' +
        '<div class="dashboard-cards">' +

        '<div class="dash-card" onclick="verCarrito()">' +
        '<div class="dash-icon">🛒</div><h3>Mis Pedidos</h3>' +
        '<p>Historial de tus compras</p><button>Ver pedidos</button></div>' +

        '<div class="dash-card" onclick="if(typeof mostrarNotificacion !== \'undefined\') mostrarNotificacion(\'Próximamente: Editar perfil\')">' +
        '<div class="dash-icon">👤</div><h3>Mi Perfil</h3>' +
        '<p>Actualiza tus datos</p><button>Editar perfil</button></div>' +

        '<div class="dash-card" onclick="if(typeof cargarPagina !== \'undefined\') cargarPagina(\'productos\')">' +
        '<div class="dash-icon">🎈</div><h3>Mis Favoritos</h3>' +
        '<p>Productos que te gustan</p><button>Ver favoritos</button></div>' +

        '</div></div></section>';
}

// Helper local para auth (no depende de main.js)
function _escAuth(text) {
    var d = document.createElement('div');
    d.textContent = String(text || '');
    return d.innerHTML;
}
