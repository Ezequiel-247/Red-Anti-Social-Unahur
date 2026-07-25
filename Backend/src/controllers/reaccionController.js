const { Reaccion, Publicacion } = require('../db/models');
const { notificarReaccion } = require('./notificacionController');

// Agregar o quitar like (Toggle)
const toggleReaccion = async (req, res) => {
    // El usuario que reacciona es siempre el autenticado, nunca el que venga en el body.
    const usuarioId = req.user.id;
    const { publicacionId } = req.body;
    try {
        // Buscamos si ya existe el like
        const existente = await Reaccion.findOne({ where: { usuarioId, publicacionId } });

        if (existente) {
            // Si existe, lo borramos (quitar like)
            await existente.destroy();
            return res.json({ mensaje: 'Like eliminado', active: false });
        }

        // Si no existe, lo creamos
        const reaccion = await Reaccion.create({ usuarioId, publicacionId });
        res.status(201).json({ mensaje: 'Like agregado', active: true });

        // Efecto secundario: solo se notifica al agregar el like, no al sacarlo.
        try {
            const publicacion = await Publicacion.findByPk(publicacionId);
            if (publicacion) await notificarReaccion(reaccion, publicacion);
        } catch (notifError) {
            console.error('Error al generar notificación de reacción:', notifError.message);
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
};

const obtenerReacciones = async (req, res) => {
    const { postId } = req.params;
    try {
        const reacciones = await Reaccion.findAll({ where: { publicacionId: postId } });
        res.json(reacciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { toggleReaccion, obtenerReacciones };