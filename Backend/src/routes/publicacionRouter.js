const {Router} = require('express')
const publicacionController = require('../controllers/publicacionController.js');
const validarPublicacion = require('../middleware/validarPublicacion.js');
const verifyToken = require('../middleware/authMiddleware.js');
const multer = require('multer');
const path = require('path');
const router = Router()

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Publicacion:
 *       type: object
 *       required:
 *         - descripcion
 *         - usuarioId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado
 *         descripcion:
 *           type: string
 *           description: Contenido del post
 *         usuarioId:
 *           type: integer
 *           description: ID del autor
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Obtener todas las publicaciones
 *     tags: [Publicaciones]
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               usuarioId:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Publicación creada
 *       403:
 *         description: Token requerido
 */
router.get('/', publicacionController.obtenerPublicaciones)

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obtener una publicación por ID
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Detalles de la publicación
 *       404:
 *         description: Publicación no encontrada
 *   delete:
 *     summary: Eliminar una publicación
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Publicación eliminada
 */
router.get('/:id', publicacionController.obtenerPublicacion)
router.post('/', verifyToken, upload.single('imagen'), validarPublicacion, publicacionController.crearPublicacion)
router.delete('/:id', verifyToken, publicacionController.eliminarPublicacion)
router.put('/:id', verifyToken, publicacionController.actualizarPublicacion) // Ruta para editar


module.exports = router