const { Usuario} = require('../db/models');
const bcrypt = require('bcrypt'); // Asegúrate de instalarlo: npm install bcrypt
const jwt = require('jsonwebtoken');

const crearUsuario = async (req, res) => {
    try {
      const { contraseña, ...restoDatos } = req.body;
      // Generamos un hash seguro de la contraseña
      const hashContraseña = await bcrypt.hash(contraseña, 10);
      
      const usuario = await Usuario.create({ ...restoDatos, contraseña: hashContraseña });
      res.status(201).json(usuario)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
}

const obtenerUsuarios = async (req, res) => {
    try {
      const usuarios = await Usuario.findAll({ attributes: { exclude: ['contraseña'] } })
      res.json(usuarios)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
}

const obtenerUsuario = async (req, res) => {
    const idUsuario = req.params.id
    try {
      const usuarios = await Usuario.findByPk(idUsuario, { attributes: { exclude: ['contraseña'] } });
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

const eliminarUsuario = async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      await usuario.destroy();
      res.json({ mensaje: 'usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

const actualizarUsuario = async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      let datosActualizar = req.body;
      if (datosActualizar.contraseña) {
        datosActualizar.contraseña = await bcrypt.hash(datosActualizar.contraseña, 10);
      }

      await usuario.update(datosActualizar);
      res.json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

//Esto esta en duda
const obtenerPublicacionDeUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    const publicacionDeUsuario = await usuario.getPublicaciones();
    res.status(200).json(publicacionDeUsuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

const obtenerComentarioDeUsuario = async (req, res)=>{
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    
    const comentarioDeUsuario = await usuario.getComentarios();
    res.status(200).json(comentarioDeUsuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el comentario' });
  }
};

const login = async (req, res) => {
  try {
    const { nombre, contraseña } = req.body;
    // Buscamos por nombre
    const usuario = await Usuario.findOne({ where: { nombre } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Comparamos la contraseña plana con el hash de la DB
    const match = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Devolvemos el usuario SIN la contraseña
    const { contraseña: _, ...usuarioSeguro } = usuario.toJSON();
    
    // Generamos el Token JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre }, 
      process.env.JWT_SECRET || 'secreto_super_secreto', 
      { expiresIn: '24h' }
    );

    res.json({ ...usuarioSeguro, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    obtenerPublicacionDeUsuario,
    obtenerComentarioDeUsuario,
    login
}