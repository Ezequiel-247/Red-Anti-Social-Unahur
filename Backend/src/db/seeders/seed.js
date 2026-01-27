const { sequelize, Usuario, Publicacion, Comentario, Etiqueta, Imagen } = require('../models');
const bcrypt = require('bcrypt');

async function seed() {
    // { force: true } elimina las tablas y las crea de nuevo (Borra todos los datos antiguos)
    await sequelize.sync({ force: true });

    // Crear usuarios
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const user1 = await Usuario.create({ nombre: 'Luna', email: 'luna@example.com', contraseña: passwordHash });
    const user2 = await Usuario.create({ nombre: 'Sol', email: 'sol@example.com', contraseña: passwordHash });

    // Crear etiquetas
    const tag1 = await Etiqueta.create({ nombre: 'arte' });
    const tag2 = await Etiqueta.create({ nombre: 'unahur' });
    const tag3 = await Etiqueta.create({ nombre: 'tecnologia' });
    const tag4 = await Etiqueta.create({ nombre: 'comida' });
    const tag5 = await Etiqueta.create({ nombre: 'viajes' });
    const tag6 = await Etiqueta.create({ nombre: 'naturaleza' });
    const tag7 = await Etiqueta.create({ nombre: 'deportes' });
    const tag8 = await Etiqueta.create({ nombre: 'animales' });

    // Crear publicaciones
    const publicacion1 = await Publicacion.create({
        descripcion: '¡Hola Mundo! Bienvenidos a mi perfil en esta nueva red.',
        usuarioId: user1.id,
        fechaDePublicacion: new Date()
    });

    const publicacion2 = await Publicacion.create({
        descripcion: 'El mejor de la historia 🔟🇦🇷',
        usuarioId: user2.id,
        fechaDePublicacion: new Date()
    });

    const publicacion3 = await Publicacion.create({
        descripcion: 'Atrapándolos a todos 🔴⚪',
        usuarioId: user1.id,
        fechaDePublicacion: new Date()
    });

    // Asociar etiquetas a publicaciones
    await publicacion1.setEtiquetas([tag2, tag3]); // unahur, tecnologia
    await publicacion2.setEtiquetas([tag7]); // deportes
    await publicacion3.setEtiquetas([tag1, tag8]); // arte, animales

    // Crear imágenes
    await Imagen.create({
        ruta: '/img/hola_mundo.png',
        publicacionId: publicacion1.id
    });

    await Imagen.create({
        ruta: '/img/messi.jpg',
        publicacionId: publicacion2.id
    });

    await Imagen.create({
        ruta: '/img/pokemon.png',
        publicacionId: publicacion3.id
    });

    // Crear comentarios
    await Comentario.create({
        contenido: '¡Bienvenida Luna!',
        usuarioId: user2.id,
        publicacionId: publicacion1.id,
        fechaDeComentario: new Date()
    });

    await Comentario.create({
        contenido: 'Muchachos...',
        usuarioId: user1.id,
        publicacionId: publicacion2.id,
        fechaDeComentario: new Date()
    });

    console.log('✅ Base de datos poblada correctamente.');
    process.exit();
}

seed();
