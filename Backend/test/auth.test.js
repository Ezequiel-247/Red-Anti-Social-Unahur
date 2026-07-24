const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const db = require('../src/db/models');
const { crearUsuarioLogueado } = require('./helpers');

beforeEach(async () => {
    await db.sequelize.sync({ force: true });
});

afterAll(async () => {
    await db.sequelize.close();
});

// Usamos POST /posts como ruta protegida "de referencia" para probar el
// middleware verifyToken de forma aislada, sin mezclarlo con las reglas de
// autorización propias de cada controlador.
describe('middleware verifyToken', () => {
    test('sin header Authorization devuelve 403', async () => {
        const res = await request(app)
            .post('/posts')
            .field('descripcion', 'Publicación de prueba de auth')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/token/i);
    });

    test('header Authorization sin "Bearer" devuelve 403', async () => {
        const res = await request(app)
            .post('/posts')
            .set('Authorization', 'tokeninvalido')
            .field('descripcion', 'Publicación de prueba de auth')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(403);
    });

    test('token con firma inválida devuelve 401', async () => {
        const tokenFalso = jwt.sign({ id: 1, nombre: 'quien-sea' }, 'secreto-incorrecto', { expiresIn: '1h' });
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${tokenFalso}`)
            .field('descripcion', 'Publicación de prueba de auth')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(401);
    });

    test('token expirado devuelve 401', async () => {
        const { id, nombre } = await crearUsuarioLogueado(app, { nombre: 'expirado' });
        const tokenExpirado = jwt.sign({ id, nombre }, process.env.JWT_SECRET, { expiresIn: -10 });
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${tokenExpirado}`)
            .field('descripcion', 'Publicación de prueba de auth')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(401);
    });

    test('token válido deja pasar la request', async () => {
        const { token } = await crearUsuarioLogueado(app, { nombre: 'valido' });
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('descripcion', 'Publicación de prueba de auth')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(201);
    });
});
