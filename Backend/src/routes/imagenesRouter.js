const {Router} = require('express')
const imagenController = require('../controllers/imagenControllers.js');
const verifyToken = require('../middleware/authMiddleware.js');
const router = Router()

router.get('/',imagenController.obtenerImagenes);
router.delete('/:id', verifyToken, imagenController.eliminarImagen); // Agregado /:id para que coincida con el controlador

module.exports = router