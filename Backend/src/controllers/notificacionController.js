const { Notificacion, Comentario, Usuario } = require('../db/models');

// Crea una notificación salvo que el destinatario sea el mismo actor
// (nadie necesita que le avisen de su propia acción).
const crearNotificacion = async ({ usuarioId, actorId, tipo, publicacionId, comentarioId = null }) => {
  if (usuarioId === actorId) return null;
  return Notificacion.create({ usuarioId, actorId, tipo, publicacionId, comentarioId });
};

// Se llama al crear un comentario nuevo:
// - Avisa al dueño del post (tipo 'comentario').
// - Avisa a quienes ya habían comentado antes en ese post (tipo 'respuesta'),
//   sin duplicar aviso a quien ya recibió el de 'comentario' ni al que acaba
//   de comentar.
const notificarComentario = async (comentario, publicacion) => {
  await crearNotificacion({
    usuarioId: publicacion.usuarioId,
    actorId: comentario.usuarioId,
    tipo: 'comentario',
    publicacionId: publicacion.id,
    comentarioId: comentario.id
  });

  const otrosComentaristas = await Comentario.findAll({
    where: { publicacionId: publicacion.id },
    attributes: ['usuarioId'],
    group: ['usuarioId']
  });

  const destinatarios = new Set(
    otrosComentaristas
      .map((c) => c.usuarioId)
      .filter((id) => id !== comentario.usuarioId && id !== publicacion.usuarioId)
  );

  for (const usuarioId of destinatarios) {
    await crearNotificacion({
      usuarioId,
      actorId: comentario.usuarioId,
      tipo: 'respuesta',
      publicacionId: publicacion.id,
      comentarioId: comentario.id
    });
  }
};

// Se llama al agregar un like nuevo (no al sacarlo).
const notificarReaccion = async (reaccion, publicacion) => {
  await crearNotificacion({
    usuarioId: publicacion.usuarioId,
    actorId: reaccion.usuarioId,
    tipo: 'reaccion',
    publicacionId: publicacion.id
  });
};

const obtenerNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: req.user.id },
      include: [
        { model: Usuario, as: 'actor', attributes: ['id', 'nombre', 'avatar'] },
        { model: Comentario, as: 'comentario', attributes: ['id', 'contenido'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) return res.status(404).json({ error: 'Notificación no encontrada' });
    if (notificacion.usuarioId !== req.user.id) {
      return res.status(403).json({ error: 'No tenés permiso sobre esta notificación' });
    }
    await notificacion.update({ leida: true });
    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leida: true },
      { where: { usuarioId: req.user.id, leida: false } }
    );
    res.json({ mensaje: 'Notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  notificarComentario,
  notificarReaccion,
  obtenerNotificaciones,
  marcarLeida,
  marcarTodasLeidas
};
