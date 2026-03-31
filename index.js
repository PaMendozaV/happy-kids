const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIGURACIÓN DE POSTGRESQL =====
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ===== CONFIGURACIÓN DEL SERVIDOR =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== CONFIGURACIÓN PARA SUBIR IMÁGENES =====
const uploadDir = path.join(__dirname, 'public', 'uploads', 'productos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'prod-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes'));
    }
});

// ===== FUNCIÓN PARA AGREGAR COLUMNA DE IMAGEN SI NO EXISTE =====
async function asegurarColumnaImagen() {
    try {
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tmproductos' AND column_name = 'imagen_url'
        `);
        
        if (checkColumn.rows.length === 0) {
            await pool.query('ALTER TABLE tmproductos ADD COLUMN imagen_url VARCHAR(500)');
            console.log('✅ Columna imagen_url agregada a tmproductos');
        }
    } catch (error) {
        console.log('⚠️ No se pudo verificar columna imagen_url:', error.message);
    }
}
asegurarColumnaImagen();

// ===== API ENDPOINTS =====

// Ruta de prueba
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Conectado a PostgreSQL', time: result.rows[0] });
    } catch (error) {
        res.json({ message: 'Error de conexión', error: error.message });
    }
});

// Obtener todos los productos (para el frontend público)
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.pkcodproducto as codproducto,
                p.nombre_p as nombreproducto,
                p.dproducto,
                p.precio_venta,
                p.stock as stock_p,
                p.serial_p,
                p.imagen_url,
                COALESCE(c.nombre_ca, '') as categoria
            FROM tmproductos p
            LEFT JOIN tdcategorias dc ON p.pkcodproducto = dc.fkcodproducto
            LEFT JOIN tmcategorias c ON dc.fkcodca = c.pkcod_ca
            WHERE p.fkcods = 1 AND p.stock > 0
            ORDER BY p.nombre_p
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en /api/productos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Obtener un producto específico
app.get('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                p.pkcodproducto as codproducto,
                p.nombre_p as nombreproducto,
                p.dproducto,
                p.precio_venta,
                p.stock as stock_p,
                p.serial_p,
                p.imagen_url
            FROM tmproductos p
            WHERE p.pkcodproducto = $1 AND p.fkcods = 1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una venta
app.post('/api/ventas', async (req, res) => {
    const { codcliente, productos, metodo_pago, total } = req.body;
    
    try {
        await pool.query('BEGIN');
        
        const ventaResult = await pool.query(`
            INSERT INTO tmventas (pkcodventa, fecha_venta, total_venta, fkmetodo_pago, fkcodcliente, fkcods)
            VALUES (COALESCE((SELECT MAX(pkcodventa) + 1 FROM tmventas), 1), CURRENT_DATE, $1, $2, $3, 1)
            RETURNING pkcodventa
        `, [total, metodo_pago || 1, codcliente || 0]);
        
        const codventa = ventaResult.rows[0].pkcodventa;
        
        for (const item of productos) {
            await pool.query(`
                INSERT INTO tdventas (pkcodetalle_v, fkcodventa, fkcodproducto)
                VALUES (COALESCE((SELECT MAX(pkcodetalle_v) + 1 FROM tdventas), 1), $1, $2)
            `, [codventa, item.codproducto]);
            
            await pool.query(`
                UPDATE tmproductos 
                SET stock = stock - $1 
                WHERE pkcodproducto = $2
            `, [item.cantidad, item.codproducto]);
        }
        
        await pool.query('COMMIT');
        res.json({ success: true, codventa, message: 'Venta registrada exitosamente' });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error en /api/ventas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.pkcodcliente as codcliente,
                c.nombre_cliente,
                c.telefono_cliente,
                u.correo_usuario
            FROM tmclientes c
            LEFT JOIN tmusuarios u ON c.fkusuario_asociado = u.pkcodusuario
            WHERE c.fkcods = 1
            ORDER BY c.nombre_cliente
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener métodos de pago
app.get('/api/metodos-pago', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pkcodmetodo as codigo, dmetodo as nombre
            FROM tmmetodo
            ORDER BY pkcodmetodo
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userResult = await pool.query(`
            SELECT 
                u.pkcodusuario as usuario_id,
                u.correo_usuario,
                u.fkrol_usuario as rol_id,
                r.drol as rol_nombre
            FROM tmusuarios u
            INNER JOIN tmrol r ON u.fkrol_usuario = r.pkcodrol_usuario
            WHERE u.correo_usuario = $1 
            AND u.contrasena_usuario = $2 
            AND u.fkcods = 1
        `, [email, password]);
        
        if (userResult.rows.length === 0) {
            return res.json({ success: false, error: 'Correo o contraseña incorrectos' });
        }
        
        const usuario = userResult.rows[0];
        let clienteData = null;
        
        if (usuario.rol_nombre === 'CLIENTE') {
            const clienteResult = await pool.query(`
                SELECT pkcodcliente as cliente_id, nombre_cliente, telefono_cliente
                FROM tmclientes
                WHERE fkusuario_asociado = $1 AND fkcods = 1
            `, [usuario.usuario_id]);
            
            if (clienteResult.rows.length > 0) {
                clienteData = clienteResult.rows[0];
            }
        }
        
        const usuarioCompleto = {
            usuario_id: usuario.usuario_id,
            correo_usuario: usuario.correo_usuario,
            rol_id: usuario.rol_id,
            rol_nombre: usuario.rol_nombre,
            cliente_id: clienteData ? clienteData.cliente_id : null,
            nombre_cliente: clienteData ? clienteData.nombre_cliente : null,
            telefono_cliente: clienteData ? clienteData.telefono_cliente : null
        };
        
        res.json({ 
            success: true, 
            usuario: usuarioCompleto,
            message: 'Inicio de sesión exitoso'
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Registro
app.post('/api/registro', async (req, res) => {
    const { nombre, telefono, email, password } = req.body;
    
    try {
        await pool.query('BEGIN');
        
        const existe = await pool.query(
            'SELECT 1 FROM tmusuarios WHERE correo_usuario = $1',
            [email]
        );
        
        if (existe.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        
        const nextIdResult = await pool.query('SELECT COALESCE(MAX(pkcodusuario), 0) + 1 as next_id FROM tmusuarios');
        const nextId = nextIdResult.rows[0].next_id;
        
        await pool.query(`
            INSERT INTO tmusuarios (pkcodusuario, correo_usuario, contrasena_usuario, fecha_registro, fkcods, fkrol_usuario)
            VALUES ($1, $2, $3, CURRENT_DATE, 1, 1)
        `, [nextId, email, password]);
        
        const nextClienteIdResult = await pool.query('SELECT COALESCE(MAX(pkcodcliente), 0) + 1 as next_id FROM tmclientes');
        const nextClienteId = nextClienteIdResult.rows[0].next_id;
        
        await pool.query(`
            INSERT INTO tmclientes (pkcodcliente, nombre_cliente, telefono_cliente, fkcods, fkusuario_asociado)
            VALUES ($1, $2, $3, 1, $4)
        `, [nextClienteId, nombre, telefono, nextId]);
        
        await pool.query('COMMIT');
        res.json({ success: true, message: 'Usuario registrado exitosamente' });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error en registro:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== ENDPOINTS ADMIN =====

// Admin: Obtener todos los productos (con imágenes)
app.get('/api/admin/productos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.pkcodproducto as codproducto, p.serial_p,
                   p.nombre_p as nombreproducto, p.dproducto,
                   p.precio_compra, p.precio_venta, p.stock,
                   p.imagen_url,
                   COALESCE(c.nombre_ca, 'Sin categoría') as categoria
            FROM tmproductos p
            LEFT JOIN tdcategorias dc ON p.pkcodproducto = dc.fkcodproducto
            LEFT JOIN tmcategorias c ON dc.fkcodca = c.pkcod_ca
            ORDER BY p.pkcodproducto ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Crear nuevo producto
app.post('/api/admin/productos/nuevo', async (req, res) => {
    const { nombre, serial, descripcion, categoria, precio_compra, precio_venta, stock } = req.body;
    
    try {
        const nextIdResult = await pool.query('SELECT COALESCE(MAX(pkcodproducto), 0) + 1 as next_id FROM tmproductos');
        const nextId = nextIdResult.rows[0].next_id;
        
        const result = await pool.query(`
            INSERT INTO tmproductos (pkcodproducto, serial_p, nombre_p, dproducto, precio_compra, precio_venta, stock, fkcods)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
            RETURNING pkcodproducto, nombre_p
        `, [nextId, serial || null, nombre, descripcion || '', precio_compra, precio_venta, stock]);
        
        if (categoria) {
            const catResult = await pool.query(`SELECT pkcod_ca FROM tmcategorias WHERE nombre_ca = $1`, [categoria]);
            if (catResult.rows.length > 0) {
                const nextCatId = await pool.query('SELECT COALESCE(MAX(pkcod_cad), 0) + 1 as next_id FROM tdcategorias');
                await pool.query(`INSERT INTO tdcategorias (pkcod_cad, fkcodca, fkcodproducto) VALUES ($1, $2, $3)`, 
                    [nextCatId.rows[0].next_id, catResult.rows[0].pkcod_ca, nextId]);
            }
        }
        
        res.json({ success: true, producto: result.rows[0] });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Actualizar producto
app.put('/api/admin/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { stock, precio_compra, precio_venta } = req.body;
    try {
        const result = await pool.query(`
            UPDATE tmproductos
            SET stock = COALESCE($1, stock),
                precio_venta = COALESCE($2, precio_venta),
                precio_compra = COALESCE($3, precio_compra)
            WHERE pkcodproducto = $4
            RETURNING pkcodproducto, nombre_p, stock, precio_venta, precio_compra
        `, [stock, precio_venta, precio_compra, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ success: true, producto: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Subir imagen de producto
app.post('/api/admin/productos/:id/imagen', upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    
    const imagenUrl = '/uploads/productos/' + req.file.filename;
    
    try {
        const result = await pool.query(`
            UPDATE tmproductos 
            SET imagen_url = $1 
            WHERE pkcodproducto = $2
            RETURNING pkcodproducto, nombre_p, imagen_url
        `, [imagenUrl, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ 
            success: true, 
            imagen_url: imagenUrl,
            producto: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error guardando imagen:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Obtener usuarios
app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.pkcodusuario as usuario_id, u.correo_usuario, u.fecha_registro,
                   s.dstatus as estado, r.drol as rol,
                   c.pkcodcliente as cliente_id, c.nombre_cliente, c.telefono_cliente
            FROM tmusuarios u
            INNER JOIN tmstatus s ON u.fkcods = s.pkcod_status
            INNER JOIN tmrol r ON u.fkrol_usuario = r.pkcodrol_usuario
            LEFT JOIN tmclientes c ON c.fkusuario_asociado = u.pkcodusuario
            ORDER BY u.pkcodusuario ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Obtener ventas
app.get('/api/admin/ventas', async (req, res) => {
    try {
        const ventas = await pool.query(`
            SELECT v.pkcodventa, v.fecha_venta, v.total_venta,
                   m.dmetodo as metodo_pago, c.nombre_cliente, c.telefono_cliente, u.correo_usuario
            FROM tmventas v
            LEFT JOIN tmmetodo m ON v.fkmetodo_pago = m.pkcodmetodo
            LEFT JOIN tmclientes c ON v.fkcodcliente = c.pkcodcliente
            LEFT JOIN tmusuarios u ON c.fkusuario_asociado = u.pkcodusuario
            WHERE v.fkcods = 1
            ORDER BY v.fecha_venta DESC, v.pkcodventa DESC
        `);
        const resultado = await Promise.all(ventas.rows.map(async (v) => {
            const det = await pool.query(`
                SELECT p.pkcodproducto, p.nombre_p, p.precio_venta
                FROM tdventas dv INNER JOIN tmproductos p ON dv.fkcodproducto = p.pkcodproducto
                WHERE dv.fkcodventa = $1
            `, [v.pkcodventa]);
            return { ...v, productos: det.rows };
        }));
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Crear venta manual
app.post('/api/admin/ventas', async (req, res) => {
    const { codcliente, productos, metodo_pago, total } = req.body;
    if (!productos || productos.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });
    try {
        await pool.query('BEGIN');
        const nextV = await pool.query('SELECT COALESCE(MAX(pkcodventa), 0) + 1 as next_id FROM tmventas');
        const codventa = nextV.rows[0].next_id;
        await pool.query(`
            INSERT INTO tmventas (pkcodventa, fecha_venta, total_venta, fkmetodo_pago, fkcodcliente, fkcods)
            VALUES ($1, CURRENT_DATE, $2, $3, $4, 1)
        `, [codventa, total, metodo_pago || 0, codcliente || 0]);
        let nextD = (await pool.query('SELECT COALESCE(MAX(pkcodetalle_v), 0) + 1 as next_id FROM tdventas')).rows[0].next_id;
        for (const item of productos) {
            await pool.query(`INSERT INTO tdventas (pkcodetalle_v, fkcodventa, fkcodproducto) VALUES ($1, $2, $3)`, [nextD, codventa, item.codproducto]);
            await pool.query(`UPDATE tmproductos SET stock = stock - $1 WHERE pkcodproducto = $2`, [item.cantidad, item.codproducto]);
            nextD++;
        }
        await pool.query('COMMIT');
        res.json({ success: true, codventa, message: 'Venta manual registrada' });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

// Admin: Estadísticas
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [ventas, productos, usuarios, top] = await Promise.all([
            pool.query(`SELECT COUNT(*) as total_ventas, COALESCE(SUM(total_venta),0) as ingresos FROM tmventas WHERE fkcods=1`),
            pool.query(`SELECT COUNT(*) as total_productos FROM tmproductos WHERE fkcods=1`),
            pool.query(`SELECT COUNT(*) as total_usuarios FROM tmusuarios WHERE fkcods=1`),
            pool.query(`SELECT p.nombre_p, COUNT(dv.fkcodproducto) as veces_vendido FROM tdventas dv INNER JOIN tmproductos p ON dv.fkcodproducto = p.pkcodproducto GROUP BY p.pkcodproducto, p.nombre_p ORDER BY veces_vendido DESC LIMIT 5`)
        ]);
        res.json({
            total_ventas: ventas.rows[0].total_ventas,
            ingresos: ventas.rows[0].ingresos,
            total_productos: productos.rows[0].total_productos,
            total_usuarios: usuarios.rows[0].total_usuarios,
            top_productos: top.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Abre tu navegador y ve a: http://localhost:${PORT}`);
    console.log(`\n📊 Base de datos: happykids`);
    console.log(`🔌 Estado: Esperando conexiones...\n`);
});
