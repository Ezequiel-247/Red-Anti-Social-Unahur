const { Reaccion } = require('../db/models');

// Agregar o quitar like (Toggle)
const toggleReaccion = async (req, res) => {
    const { usuarioId, publicacionId } = req.body;
    try {
        // Buscamos si ya existe el like
        const existente = await Reaccion.findOne({ where: { usuarioId, publicacionId } });
        
        if (existente) {
            // Si existe, lo borramos (quitar like)
            await existente.destroy();
            res.json({ mensaje: 'Like eliminado', active: false });
        } else {
            // Si no existe, lo creamos
            await Reaccion.create({ usuarioId, publicacionId });
            res.status(201).json({ mensaje: 'Like agregado', active: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
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