// ===================================================================
//  main.js  —  Happy Kids · Variables globales + lógica principal
// ===================================================================

// Usar var (no let/const) para que sean verdaderamente globales
var carrito     = [];
var productos   = [];
var metodosPago = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {
    mostrarInicio();
    cargarMetodosPago();
    window.addEventListener('load', function () {
        if (typeof verificarSesion === 'function') verificarSesion();
    });
});

// ===== NAVEGACIÓN =====
function cargarPagina(pagina) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('open');

    switch (pagina) {
        case 'inicio':    mostrarInicio();           break;
        case 'productos': cargarProductosCatalogo(); break;
        case 'nosotros':  mostrarNosotros();         break;
        case 'faq':       mostrarFAQ();              break;
        case 'login':
        case 'registro':
            if (typeof mostrarLogin === 'function') mostrarLogin();
            break;
        case 'dashboard':
            if (typeof mostrarDashboard === 'function') mostrarDashboard();
            else cargarPagina('login');
            break;
        default: mostrarInicio();
    }
}

function toggleMenu() {
    var nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('open');
}

// ===== MÉTODOS DE PAGO =====
function cargarMetodosPago() {
    fetch('/api/metodos-pago')
        .then(function (r) { return r.json(); })
        .then(function (data) { metodosPago = data; })
        .catch(function () {
            metodosPago = [
                { codigo: 0, nombre: 'EFECTIVO' },
                { codigo: 1, nombre: 'TARJETA' },
                { codigo: 2, nombre: 'TRANSFERENCIA' },
                { codigo: 3, nombre: 'NEQUI' }
            ];
        });
}

// ===== INICIO =====
function mostrarInicio() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;

    c.innerHTML =
        '<section class="hero" style="background: linear-gradient(135deg, rgba(244,143,177,0.85), rgba(129,212,250,0.85)), url(\'css/images/Banner.png\'); background-size: cover; background-position: center;">' +
        '  <div class="hero-content">' +
        '    <p class="hero-eyebrow">✨ Bienvenido a</p>' +
        '    <h1>Happy <span>Kids</span></h1>' +
        '    <p class="hero-subtitle">Piñatería y Confitería — Todo para que tu celebración sea inolvidable</p>' +
        '    <button class="btn-hero" onclick="cargarPagina(\'productos\')">🎉 VER PRODUCTOS</button>' +
        '  </div>' +
        '</section>' +

        '<section class="sobre-nosotros-home">' +
        '  <div class="container">' +
        '    <div class="sobre-texto">' +
        '      <h2>Sobre Nosotros</h2>' +
        '      <p>En Happy Kids, no solo organizamos eventos; capturamos la esencia de tus momentos más especiales.' +
        '      Con más de 15 años de experiencia en el sector, nos hemos consolidado como una opción confiable y creativa,' +
        '      siendo cómplices de miles de sonrisas y celebraciones inolvidables.</p>' +
        '      <button class="btn-ver-mas" onclick="cargarPagina(\'nosotros\')">VER MÁS →</button>' +
        '    </div>' +
        '    <div class="sobre-imagen">' +
        '      <img src="css/images/sobrenosotros.jpeg" alt="Sobre Happy Kids" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        '<section class="porque-elegirnos">' +
        '  <div class="container">' +
        '    <h2 class="section-title">¿Por qué Elegirnos?</h2>' +
        '    <div class="beneficios-grid">' +
        '      <div class="beneficio-card"><div class="beneficio-icono">🌟</div><h3>Variedad</h3><p>Más de 500 productos para tu evento perfecto</p></div>' +
        '      <div class="beneficio-card"><div class="beneficio-icono">🎯</div><h3>Experiencia Personalizada</h3><p>15+ años creando celebraciones únicas</p></div>' +
        '      <div class="beneficio-card"><div class="beneficio-icono">🏆</div><h3>Calidad</h3><p>Productos premium de las mejores marcas</p></div>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        '<section class="testimonial">' +
        '  <div class="container">' +
        '    <div class="testimonial-inner">' +
        '      <div class="testimonial-quote">"</div>' +
        '      <p class="testimonial-text">El servicio es muy adecuado, me ayudaron mucho con la selección de arreglos para la fiesta de mi hijo, la variedad de productos fue clave</p>' +
        '      <div class="testimonial-autor">' +
        '        <div class="testimonial-avatar">👩</div>' +
        '        <div><div class="testimonial-nombre">MANUELA MORA</div><div class="testimonial-rol">Cliente</div><div class="stars">★★★★★</div></div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        '<section class="categorias-section">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Categorías</h2>' +
        '    <div class="categorias-grid">' +
        '      <div class="categoria-card cat-peluches" onclick="cargarPorCategoria(\'PELUCHES\')">' +
        '        <div class="categoria-img"><img src="css/images/PelucheSeccionImagen.jpg" alt="Peluches" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">PELUCHES</div>' +
        '      </div>' +
        '      <div class="categoria-card cat-pinatas" onclick="cargarPorCategoria(\'PINATAS\')">' +
        '        <div class="categoria-img"><img src="css/images/piñatas.jpg" alt="Piñatas" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">PIÑATAS</div>' +
        '      </div>' +
        '      <div class="categoria-card cat-arreglos" onclick="cargarPorCategoria(\'DECORACION\')">' +
        '        <div class="categoria-img"><img src="css/images/ArreglosFlorales.jpg" alt="Arreglos" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">ARREGLOS</div>' +
        '      </div>' +
        '      <div class="categoria-card cat-confiteria" onclick="cargarPorCategoria(\'CONFITERIA\')">' +
        '        <div class="categoria-img"><img src="css/images/confiteria.jpg" alt="Confitería" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">CONFITERÍA</div>' +
        '      </div>' +
        '      <div class="categoria-card cat-globos" onclick="cargarPorCategoria(\'INFLABLES\')">' +
        '        <div class="categoria-img"><img src="css/images/globos.jpg" alt="Globos" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">GLOBOS</div>' +
        '      </div>' +
        '      <div class="categoria-card cat-decoracion" onclick="cargarPorCategoria(\'DECORACION\')">' +
        '        <div class="categoria-img"><img src="css/images/ArticulosDecorativos.jpg" alt="Artículos Decorativos" style="width:100%; height:100%; object-fit:cover;"></div>' +
        '        <div class="categoria-label">ARTÍCULOS DECORATIVOS</div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        '<section class="productos-destacados">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Productos Más Vendidos</h2>' +
        '    <div class="cta-login-banner">' +
        '      <a href="#" onclick="cargarPagina(\'login\')">INICIA SESIÓN</a> O ' +
        '      <a href="#" onclick="cargarPagina(\'registro\')">CREA UNA CUENTA</a> PARA REALIZAR TUS PEDIDOS' +
        '    </div>' +
        '    <div class="productos-grid" id="productos-destacados">' +
        '      <div class="cargando">⏳ Cargando productos...</div>' +
        '    </div>' +
        '  </div>' +
        '</section>';

    _cargarProductosDestacados();
}

function cargarPorCategoria(cat) {
    cargarProductosCatalogo();
    setTimeout(function () {
        var sel = document.getElementById('filtroCategoria');
        if (sel) { sel.value = cat; filtrarProductos(); }
    }, 400);
}

function _cargarProductosDestacados() {
    fetch('/api/productos')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            productos = data;
            var grid = document.getElementById('productos-destacados');
            if (!grid) return;
            var slice = data.slice(0, 4);
            grid.innerHTML = slice.length
                ? slice.map(_buildCard).join('')
                : '<p class="sin-productos">📭 No hay productos disponibles</p>';
        })
        .catch(function () {
            var grid = document.getElementById('productos-destacados');
            if (grid) grid.innerHTML = '<p class="sin-productos">No se pudieron cargar los productos</p>';
        });
}

// ===== CATÁLOGO =====
function cargarProductosCatalogo() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;

    c.innerHTML =
        '<section class="catalogo"><div class="container">' +
        '<h2>Catálogo de Productos</h2>' +
        '<div class="filtros">' +
        '  <input type="text" id="buscarProducto" placeholder="🔍 Buscar productos..." oninput="filtrarProductos()">' +
        '  <select id="filtroCategoria" onchange="filtrarProductos()">' +
        '    <option value="">Todas las categorías</option>' +
        '    <option value="PELUCHES">Peluches</option>' +
        '    <option value="CONFITERIA">Confitería</option>' +
        '    <option value="INFLABLES">Globos / Inflables</option>' +
        '    <option value="DECORACION">Decoración</option>' +
        '    <option value="DESECHABLES">Desechables</option>' +
        '    <option value="EMPAQUES">Empaques</option>' +
        '    <option value="BISUTERIA">Bisutería</option>' +
        '  </select>' +
        '</div>' +
        '<div class="productos-grid" id="contenido-catalogo">' +
        '  <div class="cargando">⏳ Cargando productos...</div>' +
        '</div>' +
        '</div></section>';

    fetch('/api/productos')
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            productos = data;
            _mostrarListaProductos(data);
        })
        .catch(function () {
            var grid = document.getElementById('contenido-catalogo');
            if (grid) grid.innerHTML =
                '<div class="error">❌ Error al cargar productos. ¿Está corriendo el servidor?<br><br>' +
                '<button onclick="cargarProductosCatalogo()" style="padding:10px 20px;margin-top:10px;background:var(--pink-dark);color:white;border:none;border-radius:8px;font-weight:800;cursor:pointer;">🔄 Reintentar</button></div>';
        });
}

function _mostrarListaProductos(lista) {
    var grid = document.getElementById('contenido-catalogo');
    if (!grid) return;
    if (!lista || !lista.length) {
        grid.innerHTML = '<div class="sin-productos">📭 No hay productos disponibles</div>';
        return;
    }
    grid.innerHTML = lista.map(_buildCard).join('');
}

function filtrarProductos() {
    var busq = ((document.getElementById('buscarProducto') || {}).value || '').toLowerCase();
    var cat  = ((document.getElementById('filtroCategoria') || {}).value || '').toUpperCase();

    var res = productos.filter(function (p) {
        var n = (p.nombreproducto || '').toLowerCase();
        var d = (p.dproducto || '').toLowerCase();
        var c = (p.categoria || '').toUpperCase();

        var coincideTexto = !busq || n.includes(busq) || d.includes(busq);
        var coincideCat   = !cat  || c === cat;
        return coincideTexto && coincideCat;
    });

    _mostrarListaProductos(res);
}

// ===== FUNCIÓN PARA MOSTRAR PRODUCTOS CON IMÁGENES DE LA BD =====
function _buildCard(p) {
    // Obtener imagen de la base de datos o usar por defecto
    let imagenUrl = '/img/producto-default.jpg';
    
    if (p.imagen_url && p.imagen_url !== 'null' && p.imagen_url !== '') {
        imagenUrl = p.imagen_url;
    }
    
    return '<div class="producto-card">' +
        '<div class="producto-icono" style="padding:0; overflow:hidden; height:180px;">' +
        '<img src="' + imagenUrl + '" alt="' + _esc(p.nombreproducto) + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'/img/producto-default.jpg\'">' +
        '</div>' +
        '<h3>' + _esc(p.nombreproducto) + '</h3>' +
        '<p class="descripcion">' + _esc(p.dproducto || 'Producto de alta calidad') + '</p>' +
        '<div class="precio">$' + formatearPrecio(p.precio_venta) + '</div>' +
        '<p class="stock">📦 Stock: ' + p.stock_p + ' unidades</p>' +
        '<button class="btn-comprar" onclick="agregarAlCarrito(' + p.codproducto + ')">🛒 Agregar al Carrito</button>' +
        '</div>';
}

// ===== CARRITO =====
function agregarAlCarrito(codproducto) {
    var p = productos.find(function (x) { return x.codproducto === codproducto; });
    if (!p) {
        fetch('/api/productos')
            .then(function (r) { return r.json(); })
            .then(function (data) { productos = data; agregarAlCarrito(codproducto); })
            .catch(function () { mostrarNotificacion('❌ Error al cargar productos', 'error'); });
        return;
    }
    var ex = carrito.find(function (i) { return i.codproducto === codproducto; });
    if (ex) { ex.cantidad++; }
    else { carrito.push({ codproducto: p.codproducto, nombre: p.nombreproducto, precio: p.precio_venta, cantidad: 1 }); }
    actualizarCarritoCount();
    mostrarNotificacion('✅ ' + p.nombreproducto + ' agregado al carrito');
}

function actualizarCarritoCount() {
    var total = carrito.reduce(function (s, i) { return s + i.cantidad; }, 0);
    var el = document.getElementById('carrito-count');
    if (el) el.textContent = total;
}

function verCarrito() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!carrito.length) {
        c.innerHTML =
            '<section class="carrito-page"><div class="container">' +
            '<h2>🛒 Carrito</h2>' +
            '<div class="carrito-vacio">' +
            '<div style="font-size:4rem;margin-bottom:16px">🛒</div>' +
            '<h3>Tu carrito está vacío</h3>' +
            '<p>¡Agrega productos para comenzar tu pedido!</p>' +
            '<button class="btn-seguir-comprando" onclick="cargarPagina(\'productos\')">🛍️ Ver Productos</button>' +
            '</div></div></section>';
        return;
    }

    var subtotal = carrito.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
    var iva      = Math.round(subtotal * 0.13);
    var total    = subtotal + iva;
    var opts     = metodosPago.map(function (m) { return '<option value="' + m.codigo + '">' + _esc(m.nombre) + '</option>'; }).join('');

    var items = carrito.map(function (item, idx) {
        return '<div class="carrito-item">' +
            '<div class="carrito-item-img">🎈</div>' +
            '<div class="carrito-item-info"><h4>' + _esc(item.nombre) + '</h4>' +
            '<p class="carrito-item-meta">$' + formatearPrecio(item.precio) + ' / unidad</p></div>' +
            '<div class="carrito-item-actions">' +
            '<div class="carrito-item-precio">$' + formatearPrecio(item.precio * item.cantidad) + '</div>' +
            '<div class="qty-control">' +
            '<button class="qty-btn" onclick="cambiarCantidad(' + idx + ',-1)">−</button>' +
            '<span class="qty-num">' + item.cantidad + '</span>' +
            '<button class="qty-btn" onclick="cambiarCantidad(' + idx + ',1)">+</button>' +
            '</div>' +
            '<button class="btn-eliminar" onclick="eliminarDelCarrito(' + idx + ')" title="Eliminar">🗑️</button>' +
            '</div></div>';
    }).join('');

    c.innerHTML =
        '<section class="carrito-page"><div class="container">' +
        '<h2>🛒 Carrito</h2>' +
        '<div class="carrito-layout">' +
        '<div class="carrito-items">' + items + '</div>' +
        '<div class="resumen-pedido">' +
        '<h3>Resumen del pedido</h3>' +
        '<div class="resumen-linea"><span>Subtotal</span><span>$' + formatearPrecio(subtotal) + '</span></div>' +
        '<div class="resumen-linea"><span>IVA (13%)</span><span>$' + formatearPrecio(iva) + '</span></div>' +
        '<div class="resumen-linea total"><span>Total</span><span>$' + formatearPrecio(total) + '</span></div>' +
        '<div class="metodo-pago-resumen"><label>💳 Método de pago</label><select id="metodoPago">' + opts + '</select></div>' +
        '<button class="btn-finalizar" onclick="finalizarCompra(' + total + ')">Finalizar compra ✅</button>' +
        '</div></div></div></section>';
}

function cambiarCantidad(idx, delta) {
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    actualizarCarritoCount();
    verCarrito();
}

function eliminarDelCarrito(idx) {
    var nombre = carrito[idx].nombre;
    carrito.splice(idx, 1);
    actualizarCarritoCount();
    verCarrito();
    mostrarNotificacion('❌ ' + nombre + ' eliminado');
}

function finalizarCompra(totalConIva) {
    if (!carrito.length) { mostrarNotificacion('El carrito está vacío', 'error'); return; }
    var subtotal   = carrito.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
    var mpEl       = document.getElementById('metodoPago');
    var metodo     = mpEl ? parseInt(mpEl.value) : 0;
    var usuario    = JSON.parse(localStorage.getItem('usuario') || '{}');
    var codcliente = usuario.cliente_id || 0;

    fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codcliente: codcliente, productos: carrito, metodo_pago: metodo, total: subtotal })
    })
    .then(function (r) { return r.json(); })
    .then(function (result) {
        if (result.success) {
            mostrarNotificacion('🎉 ¡Compra realizada! Total: $' + formatearPrecio(totalConIva || subtotal));
            carrito = [];
            actualizarCarritoCount();
            cargarPagina('productos');
        } else {
            mostrarNotificacion('❌ Error: ' + (result.error || 'Error desconocido'), 'error');
        }
    })
    .catch(function () { mostrarNotificacion('❌ Error al conectar con el servidor', 'error'); });
}

// ===== SOBRE NOSOTROS =====
function mostrarNosotros() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;
    c.innerHTML =
        '<section class="nosotros-page"><div class="container">' +
        '<h2>Sobre Nosotros</h2>' +
        '<p>En Happy Kids, no solo organizamos eventos; capturamos la esencia de tus momentos más especiales. Con más de 15 años de experiencia en el sector, nos hemos consolidado como una opción confiable y creativa, siendo cómplices de miles de sonrisas y celebraciones inolvidables.</p>' +
        '<p>Nuestra misión es simple: volver tus fiestas momentos mágicos. Ya sea un cumpleaños, un detalle especial o un gran evento corporativo, en Happy Kids estamos listos para superar tus expectativas con creatividad y profesionalismo.</p>' +
        '<p><strong>Nuestra Pasión:</strong> Cada producto ha sido cuidadosamente seleccionado para garantizar la mayor satisfacción. Trabajamos con los mejores proveedores: globos Sempertex, peluches de alta calidad, confitería importada y mucho más.</p>' +
        '</div></section>';
}

// ===== FAQ =====
function mostrarFAQ() {
    var c = document.getElementById('contenido-principal');
    if (!c) return;
    var faq = [
        ['¿Hacen envíos a domicilio?',                   'Sí, hacemos envíos en toda la ciudad. Los costos y tiempos de entrega varían según la zona.'],
        ['¿Cuáles son los métodos de pago disponibles?', 'Aceptamos efectivo, tarjeta débito/crédito, transferencia bancaria y Nequi.'],
        ['¿Puedo hacer pedidos personalizados?',          'Por supuesto. Contáctanos con anticipación y diseñamos el paquete perfecto para tu evento.'],
        ['¿Tienen servicio de decoración para eventos?',  'Sí, ofrecemos paquetes completos de decoración para todo tipo de eventos.'],
        ['¿Cuál es el tiempo de entrega?',               'Para pedidos en la ciudad: 1-2 días hábiles. Pedidos especiales pueden tardar hasta 5 días.']
    ];
    c.innerHTML =
        '<section class="faq-page"><div class="container"><h2>Preguntas Frecuentes</h2>' +
        faq.map(function (item, i) {
            return '<div class="faq-item" onclick="toggleFAQ(' + i + ')">' +
                '<div class="faq-question">' + _esc(item[0]) + ' <span class="faq-arrow">▼</span></div>' +
                '<div class="faq-answer">' + _esc(item[1]) + '</div></div>';
        }).join('') +
        '</div></section>';
}

function toggleFAQ(i) {
    var items = document.querySelectorAll('.faq-item');
    if (items[i]) items[i].classList.toggle('open');
}

// ===== HELPERS GLOBALES =====
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio);
}

function _esc(text) {
    var d = document.createElement('div');
    d.textContent = String(text || '');
    return d.innerHTML;
}

function escapeHtml(t) { return _esc(t); }

function mostrarNotificacion(mensaje, tipo) {
    tipo = tipo || 'success';
    var notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.style.cssText =
        'position:fixed;bottom:24px;right:24px;' +
        'background:' + (tipo === 'error' ? '#e53935' : '#C2185B') + ';' +
        'color:#fff;padding:13px 22px;border-radius:12px;z-index:9999;' +
        'font-family:\'Nunito\',sans-serif;font-weight:700;font-size:0.88rem;' +
        'box-shadow:0 6px 24px rgba(0,0,0,0.18);animation:hkSlide 0.3s ease;' +
        'max-width:320px;line-height:1.4;';
    document.body.appendChild(notif);
    setTimeout(function () {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(8px)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(function () { if (notif.parentNode) notif.remove(); }, 300);
    }, 2700);
}

// Keyframes para la notificación
(function () {
    var s = document.createElement('style');
    s.textContent = '@keyframes hkSlide{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(s);
}());