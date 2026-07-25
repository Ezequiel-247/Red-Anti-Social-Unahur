const { Op } = require('sequelize');
const { Usuario, Comentario, Reaccion } = require('../db/models');
const { notificarComentario, notificarReaccion } = require('../controllers/notificacionController');

// Simula que la comunidad de usuarios de prueba (todos con email @example.com,
// creados por el seeder) reacciona a un post nuevo, para que la app no se
// sienta vacía la primera vez que alguien la prueba de verdad.
// Solo se dispara para posts de usuarios REALES (no de prueba), para no
// duplicar interacciones sobre las que ya trae el seed entre los propios
// usuarios de prueba.

const MENSAJES = [
    '¡Buenísimo! 🙌',
    'Me encantó esto',
    'Totalmente de acuerdo',
    '¡Gracias por compartir!',
    'Jaja buenísimo 😂',
    'Qué interesante, no lo sabía',
    'Esto está genial',
    'Me pasó algo parecido jaja',
    '+1',
    'Buena esa 👏',
];

const elegirAlAzar = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mezclar = (arr) => [...arr].sort(() => 0.5 - Math.random());

// Milisegundos de delay al azar entre minMs y maxMs, para que las reacciones
// no aparezcan todas juntas apenas se publica (se sentiría robótico).
const delayAlAzar = (minMs, maxMs) => minMs + Math.random() * (maxMs - minMs);

const simularEngagement = async (publicacion) => {
    try {
        const autor = await Usuario.findByPk(publicacion.usuarioId);
        if (!autor || autor.email?.endsWith('@example.com')) return;

        const usuariosDePrueba = await Usuario.findAll({
            where: { email: { [Op.like]: '%@example.com' } }
        });
        if (usuariosDePrueba.length === 0) return;

        const cantidadLikes = 1 + Math.floor(Math.random() * Math.min(4, usuariosDePrueba.length));
        const cantidadComentarios = Math.random() < 0.7
            ? 1 + Math.floor(Math.random() * Math.min(2, usuariosDePrueba.length))
            : 0;

        mezclar(usuariosDePrueba).slice(0, cantidadLikes).forEach((usuario) => {
            setTimeout(async () => {
                try {
                    const reaccion = await Reaccion.create({ usuarioId: usuario.id, publicacionId: publicacion.id });
                    await notificarReaccion(reaccion, publicacion);
                } catch (error) {
                    console.error('Error en engagement bot (like):', error.message);
                }
            }, delayAlAzar(4000, 40000));
        });

        mezclar(usuariosDePrueba).slice(0, cantidadComentarios).forEach((usuario) => {
            setTimeout(async () => {
                try {
                    const comentario = await Comentario.create({
                        contenido: elegirAlAzar(MENSAJES),
                        usuarioId: usuario.id,
                        publicacionId: publicacion.id,
                        fechaDeComentario: new Date()
                    });
                    await notificarComentario(comentario, publicacion);
                } catch (error) {
                    console.error('Error en engagement bot (comentario):', error.message);
                }
            }, delayAlAzar(8000, 55000));
        });
    } catch (error) {
        console.error('Error en engagement bot:', error.message);
    }
};

module.exports = { simularEngagement };
