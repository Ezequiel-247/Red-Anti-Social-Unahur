const schemaComentario = require("./schemas/comentarioSchema");

const validarComentario = (req, res, next) => {
    const { error } = schemaComentario.validate(req.body)
    if(error){
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
};

module.exports = validarComentario;