const schemaImagen = require("./schemas/imagenSchema");

const validarImagen = (req,res,next) =>{
    const { error } = schemaImagen.validate(req.body)
    if(error){
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
}

module.exports = validarImagen;