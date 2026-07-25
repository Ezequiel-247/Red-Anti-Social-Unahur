const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificacionController.obtenerNotificaciones);
router.patch('/read-all', verifyToken, notificacionController.marcarTodasLeidas);
router.patch('/:id/read', verifyToken, notificacionController.marcarLeida);

module.exports = router;
