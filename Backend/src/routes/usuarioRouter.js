const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const usuarioController = require('../controllers/usuarioController');
const validarUsuario = require('../middleware/validarUsuario');
const verifyToken = require('../middleware/authMiddleware');
const { limits, fileFilter, nombreArchivoSeguro } = require('../middleware/imagenUploadOptions');
const router = Router()

// Limita intentos de login para dificultar fuerza bruta de contraseñas.
// Se desactiva en tests: un solo archivo de test puede loguear decenas de
// usuarios de prueba en segundos, muy por encima de cualquier límite realista.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 intentos por IP en la ventana
    message: { error: 'Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test'
});

// Configuración de Multer para la foto de perfil (mismas reglas que las imágenes de posts)
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/img')),
    // Nunca usar file.originalname tal cual: permite path traversal (ver imagenUploadOptions.js)
    filename: (req, file, cb) => cb(null, nombreArchivoSeguro('avatar-', file.originalname))
});
const uploadAvatar = multer({ storage: avatarStorage, limits, fileFilter });

//algunas validaciones agregadas
router.get('/', usuarioController.obtenerUsuarios);
router.get('/:id', usuarioController.obtenerUsuario);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - contraseña
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/', validarUsuario, usuarioController.crearUsuario);
router.put('/:id', verifyToken, validarUsuario, usuarioController.actualizarUsuario);
router.delete('/:id', verifyToken, usuarioController.eliminarUsuario);
router.post('/:id/avatar', verifyToken, uploadAvatar.single('avatar'), usuarioController.actualizarAvatar);
router.delete('/:id/avatar', verifyToken, usuarioController.eliminarAvatar);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - contraseña
 *             properties:
 *               nombre:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', loginLimiter, usuarioController.login);

//router.get('/:id/publicacion', usuarioController.obtenerPublicacionDeUsuario);
//router.get('/:id/comentario', usuarioController.obtenerComentarioDeUsuario);

module.exports = router