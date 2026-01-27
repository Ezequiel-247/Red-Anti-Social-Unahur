const publicacionSchema = require("./schemas/publicacionSchema");

const validarPublicacion = (req, res, next) => {
    console.log("DEBUG - req.body en validarPublicacion:", req.body);
    const { error } = publicacionSchema.validate(req.body)
    if(error){
        console.log("DEBUG - Error de validación:", error.details[0].message);
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
};

module.exports = validarPublicacion;