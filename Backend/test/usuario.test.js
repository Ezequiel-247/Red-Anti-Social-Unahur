const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/models');
const { crearUsuarioLogueado } = require('./helpers');

beforeEach(async () => {
    await db.sequelize.sync({ force: true });
});

afterAll(async () => {
    await db.sequelize.close();
});

describe('POST /users (registro)', () => {
    test('registra un usuario nuevo y no devuelve la contraseña en texto plano', async () => {
        const res = await request(app)
            .post('/users')
            .send({ nombre: 'martina', email: 'martina@test.com', contraseña: 'pass123' })
            .expect(201);

        expect(res.body.nombre).toBe('martina');
        expect(res.body.contraseña).not.toBe('pass123'); // tiene que venir hasheada, no en texto plano
    });

    test('rechaza un nombre de usuario duplicado', async () => {
        await crearUsuarioLogueado(app, { nombre: 'duplicado' });

        const res = await request(app)
            .post('/users')
            .send({ nombre: 'duplicado', email: 'otro@test.com', contraseña: 'pass123' });

        expect(res.status).toBe(400);
    });

    test('rechaza una contraseña muy corta', async () => {
        const res = await request(app)
            .post('/users')
            .send({ nombre: 'corta', email: 'corta@test.com', contraseña: '123' });

        expect(res.status).toBe(400);
    });
});

describe('POST /users/login', () => {
    test('devuelve un token con credenciales correctas', async () => {
        const { nombre, contraseña } = await crearUsuarioLogueado(app, { nombre: 'login_ok' });

        const res = await request(app)
            .post('/users/login')
            .send({ nombre, contraseña })
            .expect(200);

        expect(typeof res.body.token).toBe('string');
        expect(res.body.contraseña).toBeUndefined();
    });

    test('devuelve 401 con la contraseña incorrecta', async () => {
        const { nombre } = await crearUsuarioLogueado(app, { nombre: 'login_mal' });

        const res = await request(app)
            .post('/users/login')
            .send({ nombre, contraseña: 'noesesta' });

        expect(res.status).toBe(401);
    });

    test('devuelve 404 si el usuario no existe', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ nombre: 'no_existe_este_usuario', contraseña: 'pass1234' });

        expect(res.status).toBe(404);
    });
});

describe('GET /users/:id', () => {
    test('devuelve 404 si el usuario no existe', async () => {
        await request(app).get('/users/999999').expect(404);
    });

    test('devuelve el usuario sin el campo contraseña', async () => {
        const { id } = await crearUsuarioLogueado(app, { nombre: 'consultado' });
        const res = await request(app).get(`/users/${id}`).expect(200);
        expect(res.body.nombre).toBe('consultado');
        expect(res.body.contraseña).toBeUndefined();
    });
});

describe('PUT /users/:id (autorización)', () => {
    test('sin token devuelve 403', async () => {
        const { id } = await crearUsuarioLogueado(app, { nombre: 'sin_token_put' });
        const res = await request(app)
            .put(`/users/${id}`)
            .send({ nombre: 'sin_token_put', email: 'x@test.com', contraseña: 'pass1234' });
        expect(res.status).toBe(403);
    });

    test('un usuario no puede editar la cuenta de otro (IDOR)', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'usuario_a' });
        const b = await crearUsuarioLogueado(app, { nombre: 'usuario_b' });

        const res = await request(app)
            .put(`/users/${b.id}`)
            .set('Authorization', `Bearer ${a.token}`)
            .send({ nombre: 'usuario_b_hackeado', email: b.email, contraseña: 'pass1234' });

        expect(res.status).toBe(403);
    });

    test('un usuario puede editar su propia cuenta', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'usuario_propio' });

        const res = await request(app)
            .put(`/users/${a.id}`)
            .set('Authorization', `Bearer ${a.token}`)
            .send({ nombre: 'usuario_propio', email: 'nuevo@test.com', contraseña: 'pass1234' });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('nuevo@test.com');
    });
});

describe('DELETE /users/:id (autorización)', () => {
    test('sin token devuelve 403', async () => {
        const { id } = await crearUsuarioLogueado(app, { nombre: 'sin_token_del' });
        const res = await request(app).delete(`/users/${id}`);
        expect(res.status).toBe(403);
    });

    test('un usuario no puede borrar la cuenta de otro (IDOR)', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'borra_a' });
        const b = await crearUsuarioLogueado(app, { nombre: 'borra_b' });

        const res = await request(app)
            .delete(`/users/${b.id}`)
            .set('Authorization', `Bearer ${a.token}`);

        expect(res.status).toBe(403);

        // Y sigue existiendo
        await request(app).get(`/users/${b.id}`).expect(200);
    });

    test('un usuario puede borrar su propia cuenta', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'borra_propia' });

        await request(app)
            .delete(`/users/${a.id}`)
            .set('Authorization', `Bearer ${a.token}`)
            .expect(200);

        await request(app).get(`/users/${a.id}`).expect(404);
    });
});
