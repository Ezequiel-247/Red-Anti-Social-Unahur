const {Router} = require('express')
const etiquetaController = require('../controllers/etiquetaController.js');
const validarEtiqueta = require('../middleware/validarEtiqueta.js');
const router = Router()

// Rutas para las etiquetas
router.post('/', validarEtiqueta, etiquetaController.crearEtiqueta)
router.get('/', etiquetaController.obtenerEtiquetas)
router.delete('/:id', etiquetaController.eliminarEtiqueta)
router.put('/:id', validarEtiqueta, etiquetaController.actualizarEtiqueta)

module.exports = router