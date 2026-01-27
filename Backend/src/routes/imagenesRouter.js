const {Router} = require('express')
const imagenController = require('../controllers/imagenControllers.js');
const router = Router()

router.get('/',imagenController.obtenerImagenes);
router.delete('/:id', imagenController.eliminarImagen); // Agregado /:id para que coincida con el controlador

module.exports = router