const request = require('supertest');

// Registra y loguea un usuario de prueba contra la app de test; devuelve el
// token JWT y los datos básicos para usar en el resto del test.
async function crearUsuarioLogueado(app, overrides = {}) {
    const nombre = overrides.nombre || `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const email = overrides.email || `${nombre}@test.com`;
    const contraseña = overrides.contraseña || 'pass1234';

    await request(app)
        .post('/users')
        .send({ nombre, email, contraseña })
        .expect(201);

    const loginRes = await request(app)
        .post('/users/login')
        .send({ nombre, contraseña })
        .expect(200);

    return { token: loginRes.body.token, id: loginRes.body.id, nombre, email, contraseña };
}

// Crea una publicación válida para el usuario dueño del token dado.
// OJO: no hace await acá adentro, para que el caller pueda encadenar .expect()
// (p. ej. `await crearPublicacion(app, token).expect(201)`) o directamente
// awaitear la respuesta si no necesita aserciones extra.
function crearPublicacion(app, token, overrides = {}) {
    return request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .field('descripcion', overrides.descripcion || 'Publicación de prueba con más de 5 caracteres')
        .field('fechaDePublicacion', new Date().toISOString())
        .field('usuarioId', String(overrides.usuarioId ?? 999)); // Joi lo exige presente; el server ignora el valor
}

module.exports = { crearUsuarioLogueado, crearPublicacion };
