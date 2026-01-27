const { Publicacion, Imagen, Usuario, Comentario, sequelize } = require('../db/models');

const obtenerPublicaciones = async (req, res) =>{
    try{
        const { userId } = req.query;
        
        const options = {
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'id'] },
                { model: Imagen, as: 'imagenes' },
                { 
                    model: Comentario, 
                    as: 'comentarios',
                    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'id'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        };

        if (userId) {
            options.where = { usuarioId: userId };
        }

        const publicaciones = await Publicacion.findAll(options)
        res.json(publicaciones)
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
}

const obtenerPublicacion = async (req, res) =>{
    const { id } = req.params
    try{
        const publicacion = await Publicacion.findByPk(id, {
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'id'] },
                { model: Imagen, as: 'imagenes' },
                { 
                    model: Comentario, 
                    as: 'comentarios',
                    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'id'] }]
                }
            ]
        })
        if (!publicacion){
            return res.status(404).json({ error: 'Publicación no encontrada' });
        } 
        res.json(publicacion)
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
}

const crearPublicacion = async (req, res) =>{
    if (!req.body) {
        return res.status(400).json({ error: 'No se recibieron datos. Verifique la configuración de Multer.' });
    }

    // Iniciamos una transacción
    const t = await sequelize.transaction();
    try{
        let { Tags, ...data } = req.body;

        // Pasamos { transaction: t } a todas las operaciones de escritura
        const publicacion = await Publicacion.create(data, { transaction: t });
        
        if (Tags) {
            const tagsArray = Array.isArray(Tags) ? Tags : [Tags];
            if (tagsArray.length > 0) {
                await publicacion.setEtiquetas(tagsArray, { transaction: t }); 
            }
        }

        // Si se subió una imagen, la guardamos en la DB asociada al post
        if (req.file) {
            const ruta = `/img/${req.file.filename}`;
            await Imagen.create({ ruta: ruta, publicacionId: publicacion.id }, { transaction: t });
        }

        await t.commit(); // Confirmamos los cambios si todo salió bien
        res.status(201).json(publicacion)
    }
    catch(error){
        await t.rollback(); // Deshacemos cambios si algo falló
        res.status(500).json({error: error.message})
    }
}

const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params
        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion){
            return res.status(404).json({ error: 'publicacion no encontrada' });
        }
        await publicacion.destroy();
        res.json({ mensaje: 'publicacion eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



// Eliminar una imagen específica de una publicación
const eliminarImagenDePublicacion = async (req, res) => {
    const { id, imagenId } = req.params;
    try {
        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion){
            return res.status(404).json({ error: 'Publicación no encontrada' });
        } 
        const imagen = await Imagen.findOne({ where: { id: imagenId, publicacionId: id } });

        if (!imagen){
            return res.status(404).json({ error: 'Imagen no encontrada para esta publicación' });
        } 
        await imagen.destroy();
        res.json({ mensaje: 'Imagen eliminada de la publicación' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Actualizar una imagen específica de una publicación
const actualizarImagenDePublicacion = async (req, res) => {
    const { id, imagenId } = req.params;
    try {
        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion){
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        const imagen = await Imagen.findOne({ where: { id: imagenId, publicacionId: id } });
        if (!imagen){
            return res.status(404).json({ error: 'Imagen no encontrada para esta publicación' });
        } 
        await imagen.update(req.body);
        res.json(imagen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Actualizar una publicación (descripción y etiquetas)
const actualizarPublicacion = async (req, res) => {
    const { id } = req.params;
    const { Tags, ...data } = req.body;
    try {
        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion){
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        await publicacion.update(data);

        if (Tags) {
            await publicacion.setEtiquetas(Tags);
        }

        res.json(publicacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    obtenerPublicaciones,
    obtenerPublicacion,
    crearPublicacion,
    eliminarPublicacion,
    eliminarImagenDePublicacion, 
    actualizarImagenDePublicacion,
    actualizarPublicacion
}