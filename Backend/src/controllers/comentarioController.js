const { Comentario } = require('../db/models')

const crearComentario = async (req, res) => {
    try {
      const comentario = await Comentario.create(req.body)
      res.status(201).json(comentario)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
}

const obtenerComentarios = async (req, res) => {
    try {
      const comentarios = await Comentario.findAll()
      res.json(comentarios)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
}

const eliminarComentario = async (req, res) => {
    try {
      const { id } = req.params
      const comentario = await Comentario.findByPk(id);
      if (!comentario) return res.status(404).json({ error: 'comentario no encontrado' });
      await comentario.destroy();
      res.json({ mensaje: 'comentario eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

const actualizarComentario = async (req, res) => {
    try {
      const { id } = req.params
      const comentario = await Comentario.findByPk(id);
      if (!comentario) return res.status(404).json({ error: 'comentario no encontrado' });
      await comentario.update(req.body);
      res.json(comentario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

module.exports = {
    crearComentario,
    obtenerComentarios,
    eliminarComentario,
    actualizarComentario
}