const express = require('express');
const router = express.Router();
const reaccionController = require('../controllers/reaccionController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/toggle', verifyToken, reaccionController.toggleReaccion);
router.get('/post/:postId', reaccionController.obtenerReacciones);

module.exports = router;