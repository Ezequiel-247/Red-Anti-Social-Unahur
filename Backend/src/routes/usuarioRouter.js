const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const validarUsuario = require('../middleware/validarUsuario');
const router = Router()

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
router.put('/:id', validarUsuario, usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

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
router.post('/login', usuarioController.login);

//router.get('/:id/publicacion', usuarioController.obtenerPublicacionDeUsuario);
//router.get('/:id/comentario', usuarioController.obtenerComentarioDeUsuario);

module.exports = router