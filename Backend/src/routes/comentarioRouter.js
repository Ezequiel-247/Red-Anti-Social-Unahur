const {Router} = require('express')
const comentarioController = require('../controllers/comentarioController.js');
const validarComentario = require('../middleware/validarComentario.js');
const router = Router()

// Rutas para las etiquetas
router.post('/', validarComentario, comentarioController.crearComentario)
router.get('/', comentarioController.obtenerComentarios)
router.delete('/:id', comentarioController.eliminarComentario)
router.put('/:id', validarComentario, comentarioController.actualizarComentario)

module.exports = router