const { Comentario } = require('../db/models')

const crearComentario = async (req, res) => {
    try {
      // Ignoramos cualquier usuarioId que venga en el body: el autor es siempre
      // quien está autenticado, para que no se pueda comentar en nombre de otro.
      const comentario = await Comentario.create({ ...req.body, usuarioId: req.user.id })
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
      if (comentario.usuarioId !== req.user.id) {
        return res.status(403).json({ error: 'No tenés permiso para eliminar este comentario' });
      }
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
      if (comentario.usuarioId !== req.user.id) {
        return res.status(403).json({ error: 'No tenés permiso para editar este comentario' });
      }
      // Igual que en la creación: el dueño del comentario no puede cambiar con el body.
      await comentario.update({ ...req.body, usuarioId: comentario.usuarioId });
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