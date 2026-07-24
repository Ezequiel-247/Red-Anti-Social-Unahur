const {Router} = require('express')
const comentarioController = require('../controllers/comentarioController.js');
const validarComentario = require('../middleware/validarComentario.js');
const verifyToken = require('../middleware/authMiddleware.js');
const router = Router()

// Rutas para las etiquetas
router.post('/', verifyToken, validarComentario, comentarioController.crearComentario)
router.get('/', comentarioController.obtenerComentarios)
router.delete('/:id', verifyToken, comentarioController.eliminarComentario)
router.put('/:id', verifyToken, validarComentario, comentarioController.actualizarComentario)

module.exports = router