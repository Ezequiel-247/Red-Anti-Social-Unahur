const express = require('express');
const router = express.Router();
const reaccionController = require('../controllers/reaccionController');

router.post('/toggle', reaccionController.toggleReaccion);
router.get('/post/:postId', reaccionController.obtenerReacciones);

module.exports = router;