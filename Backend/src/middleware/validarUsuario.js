const usuarioSchema = require("./schemas/usuarioSchema")

const validarUsuario = (req, res, next) => {
    const { error } = usuarioSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
};

module.exports = validarUsuario