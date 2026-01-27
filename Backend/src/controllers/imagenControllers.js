const { Imagen} = require("../db/models");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para guardar archivos en public/img
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ajuste de ruta: subir dos niveles para salir de 'controllers' y 'src' hacia la raíz
        cb(null, path.join(__dirname, '../../public/img'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const obtenerImagenes = async(req,res)=>{
    try{
        const imagenes = await Imagen.findAll()
        res.json(imagenes)
    }
    catch(error){
        res.json({error: error.message})
    }
};

const eliminarImagen = async (req,res) => {
    try{
        const {id} = req.params
        const imagen = await Imagen.findByPk(id)
        if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });

        // Construir ruta absoluta al archivo y borrarlo si existe
        const rutaArchivo = path.join(__dirname, '../../public', imagen.ruta);
        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        }

        await imagen.destroy();
        res.json({ mensaje: 'imagen eliminada' });
    } catch(error){
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerImagenes,
    eliminarImagen,
    upload
};