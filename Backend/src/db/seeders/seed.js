const { sequelize, Usuario, Publicacion, Comentario, Etiqueta, Imagen, Reaccion } = require('../models');
const bcrypt = require('bcrypt');

// Fecha relativa: "hace N días" para que el feed se vea con actividad real,
// no todo publicado en el mismo segundo.
const haceDias = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
};

async function seed() {
    // { force: true } elimina las tablas y las crea de nuevo (Borra todos los datos antiguos)
    await sequelize.sync({ force: true });

    const passwordHash = await bcrypt.hash('123456', 10);

    // --- Usuarios ---
    const usuariosData = [
        { nombre: 'Luna', email: 'luna@example.com' },
        { nombre: 'Sol', email: 'sol@example.com' },
        { nombre: 'Mauricio', email: 'mauricio@example.com' },
        { nombre: 'Cami', email: 'cami@example.com' },
        { nombre: 'Fede', email: 'fede@example.com' },
        { nombre: 'Rocio', email: 'rocio@example.com' },
        { nombre: 'Nico', email: 'nico@example.com' },
        { nombre: 'Vale', email: 'vale@example.com' },
    ];
    const usuarios = {};
    for (const u of usuariosData) {
        usuarios[u.nombre] = await Usuario.create({ ...u, contraseña: passwordHash });
    }

    // --- Etiquetas ---
    const etiquetasData = ['arte', 'unahur', 'tecnologia', 'comida', 'viajes', 'naturaleza', 'deportes', 'animales', 'musica', 'estudio'];
    const etiquetas = {};
    for (const nombre of etiquetasData) {
        etiquetas[nombre] = await Etiqueta.create({ nombre });
    }

    // --- Publicaciones ---
    // { autor, descripcion, diasAtras, imagen (archivo local en public/img) o
    //   imagenSeed (foto de Lorem Picsum, un servicio público de fotos de
    //   placeholder: mismo seed = siempre la misma foto, no hay que descargar
    //   ni guardar nada), tags }
    const publicacionesData = [
        { autor: 'Luna', descripcion: '¡Hola Mundo! Bienvenidos a mi perfil en esta nueva red.', diasAtras: 9, imagen: 'hola_mundo.png', tags: ['unahur', 'tecnologia'] },
        { autor: 'Sol', descripcion: 'El mejor de la historia 🔟🇦🇷', diasAtras: 8, imagen: 'messi.jpg', tags: ['deportes'] },
        { autor: 'Luna', descripcion: 'Atrapándolos a todos 🔴⚪', diasAtras: 7, imagen: 'pokemon.png', tags: ['arte', 'animales'] },
        { autor: 'Mauricio', descripcion: 'Repasando el modelo de la base de datos para la entrega de mañana, cero dormir 😅', diasAtras: 6, imagenSeed: 'estudio-database', tags: ['unahur', 'estudio'] },
        { autor: 'Cami', descripcion: 'Primer día en la UNAHUR, ¡qué lindo campus! 🌳', diasAtras: 6, imagenSeed: 'campus-unahur', tags: ['unahur'] },
        { autor: 'Fede', descripcion: 'Alguien que me pase los apuntes de la clase de ayer, no llegué a anotar todo', diasAtras: 5, imagenSeed: 'apuntes-clase', tags: ['estudio', 'unahur'] },
        { autor: 'Rocio', descripcion: 'Fin de semana en la montaña, necesitaba desconectar un poco de las materias 🏔️', diasAtras: 4, imagenSeed: 'montana-viaje', tags: ['viajes', 'naturaleza'] },
        { autor: 'Nico', descripcion: 'Terminé de armar mi primer proyecto con Node y Sequelize, se siente bien 💻', diasAtras: 3, imagenSeed: 'code-laptop', tags: ['tecnologia'] },
        { autor: 'Vale', descripcion: 'Receta de la abuela para el domingo en familia 🍝', diasAtras: 2, imagenSeed: 'comida-pasta', tags: ['comida'] },
        { autor: 'Sol', descripcion: 'Playlist para estudiar toda la noche antes del parcial 🎧', diasAtras: 1, imagenSeed: 'musica-audifonos', tags: ['musica', 'estudio'] },
        { autor: 'Mauricio', descripcion: 'Alguien vio el partido de anoche? no lo puedo creer todavía', diasAtras: 1, imagenSeed: 'futbol-partido', tags: ['deportes'] },
        { autor: 'Cami', descripcion: 'Adopté a este gato en el campus, se viene a clase conmigo 🐱', diasAtras: 0, imagenSeed: 'gato-adoptado', tags: ['animales'] },
    ];

    const publicaciones = [];
    for (const p of publicacionesData) {
        const publicacion = await Publicacion.create({
            descripcion: p.descripcion,
            usuarioId: usuarios[p.autor].id,
            fechaDePublicacion: haceDias(p.diasAtras)
        });

        if (p.tags?.length) {
            await publicacion.setEtiquetas(p.tags.map((t) => etiquetas[t]));
        }

        if (p.imagen) {
            await Imagen.create({ ruta: `/img/${p.imagen}`, publicacionId: publicacion.id });
        } else if (p.imagenSeed) {
            await Imagen.create({ ruta: `https://picsum.photos/seed/${p.imagenSeed}/800/600`, publicacionId: publicacion.id });
        }

        publicaciones.push({ ...p, instancia: publicacion });
    }

    const porDescripcion = (fragmento) => publicaciones.find((p) => p.descripcion.includes(fragmento)).instancia;

    // --- Comentarios ---
    const comentariosData = [
        { autor: 'Sol', post: '¡Hola Mundo!', contenido: '¡Bienvenida Luna!', diasAtras: 9 },
        { autor: 'Mauricio', post: '¡Hola Mundo!', contenido: 'Che qué buena onda esta red, felicitaciones', diasAtras: 8 },
        { autor: 'Luna', post: 'El mejor de la historia', contenido: 'Muchachos...', diasAtras: 8 },
        { autor: 'Nico', post: 'El mejor de la historia', contenido: 'Ese gol lo tengo grabado a fuego', diasAtras: 7 },
        { autor: 'Fede', post: 'modelo de la base de datos', contenido: 'Yo también estoy repasando, ¿tenés las diapos del último módulo?', diasAtras: 6 },
        { autor: 'Rocio', post: 'Primer día en la UNAHUR', contenido: '¡Bienvenida! Ya vas a ver que el campus se hace chico de tanto que lo vas a recorrer', diasAtras: 6 },
        { autor: 'Vale', post: 'apuntes de la clase de ayer', contenido: 'Te los paso por privado', diasAtras: 5 },
        { autor: 'Cami', post: 'Fin de semana en la montaña', contenido: 'Qué envidia, se ve hermoso', diasAtras: 4 },
        { autor: 'Sol', post: 'proyecto con Node y Sequelize', contenido: 'Grande Nico, seguí así', diasAtras: 3 },
        { autor: 'Mauricio', post: 'Receta de la abuela', contenido: 'Esto lo hago este finde seguro', diasAtras: 2 },
        { autor: 'Luna', post: 'Playlist para estudiar', contenido: 'Justo lo que necesitaba, gracias', diasAtras: 1 },
        { autor: 'Fede', post: 'gato en el campus', contenido: 'jajaja quiero conocerlo', diasAtras: 0 },
    ];

    for (const c of comentariosData) {
        await Comentario.create({
            contenido: c.contenido,
            usuarioId: usuarios[c.autor].id,
            publicacionId: porDescripcion(c.post).id,
            fechaDeComentario: haceDias(c.diasAtras)
        });
    }

    // --- Reacciones (likes) ---
    const nombresUsuarios = Object.keys(usuarios);
    for (const { instancia } of publicaciones) {
        // A cada post le da like un subconjunto aleatorio de usuarios (menos su propio autor).
        const candidatos = nombresUsuarios.filter((n) => usuarios[n].id !== instancia.usuarioId);
        const cantidadLikes = Math.floor(Math.random() * candidatos.length);
        const shuffled = candidatos.sort(() => 0.5 - Math.random()).slice(0, cantidadLikes);
        for (const nombre of shuffled) {
            await Reaccion.create({ usuarioId: usuarios[nombre].id, publicacionId: instancia.id });
        }
    }

    console.log(`✅ Base de datos poblada: ${usuariosData.length} usuarios, ${publicacionesData.length} publicaciones, ${comentariosData.length} comentarios.`);
    console.log('   Todas las contraseñas de los usuarios de prueba son: 123456');
    process.exit();
}

seed();
