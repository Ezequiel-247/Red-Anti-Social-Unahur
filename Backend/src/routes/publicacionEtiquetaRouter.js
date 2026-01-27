const {Router} = require('express')
const publicacionEtiquetaController = require('../controllers/publicacionEtiquetaController.js');
const router = Router()

// Rutas para los tags de las publicaciones
router.get('/etiquetas/:id/publicaciones', publicacionEtiquetaController.obtenerPublicacionesEtiquetas)
router.post('/', publicacionEtiquetaController.crearPublicacionEtiqueta) 
router.delete('/', publicacionEtiquetaController.eliminarPublicacionEtiqueta) 

module.exports = router