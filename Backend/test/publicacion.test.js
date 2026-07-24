const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/models');
const { crearUsuarioLogueado, crearPublicacion } = require('./helpers');

beforeEach(async () => {
    await db.sequelize.sync({ force: true });
});

afterAll(async () => {
    await db.sequelize.close();
});

describe('GET /posts', () => {
    test('es público (no requiere token) y devuelve un array', async () => {
        const res = await request(app).get('/posts').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('?userId= filtra por autor', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'filtro_a' });
        const b = await crearUsuarioLogueado(app, { nombre: 'filtro_b' });
        await crearPublicacion(app, a.token).expect(201);
        await crearPublicacion(app, b.token).expect(201);

        const res = await request(app).get(`/posts?userId=${a.id}`).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].usuarioId).toBe(a.id);
    });
});

describe('POST /posts', () => {
    test('sin token devuelve 403', async () => {
        const res = await request(app)
            .post('/posts')
            .field('descripcion', 'Publicación sin token de prueba')
            .field('fechaDePublicacion', new Date().toISOString())
            .field('usuarioId', '1');
        expect(res.status).toBe(403);
    });

    test('ignora el usuarioId del body y usa el del token (evita publicar en nombre de otro)', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'autor_real' });
        const victima = await crearUsuarioLogueado(app, { nombre: 'autor_falso' });

        const res = await crearPublicacion(app, a.token, { usuarioId: victima.id });

        expect(res.status).toBe(201);
        expect(res.body.usuarioId).toBe(a.id);
        expect(res.body.usuarioId).not.toBe(victima.id);
    });

    test('rechaza una descripción demasiado corta', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'desc_corta' });
        const res = await crearPublicacion(app, a.token, { descripcion: 'hi' });
        expect(res.status).toBe(400);
    });
});

describe('PUT /posts/:id y DELETE /posts/:id (autorización)', () => {
    test('otro usuario no puede editar una publicación ajena (IDOR)', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'edit_autor' });
        const otro = await crearUsuarioLogueado(app, { nombre: 'edit_otro' });
        const post = await crearPublicacion(app, autor.token);

        const res = await request(app)
            .put(`/posts/${post.body.id}`)
            .set('Authorization', `Bearer ${otro.token}`)
            .send({ descripcion: 'Descripción modificada por el atacante' });

        expect(res.status).toBe(403);
    });

    test('otro usuario no puede borrar una publicación ajena (IDOR)', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'del_autor' });
        const otro = await crearUsuarioLogueado(app, { nombre: 'del_otro' });
        const post = await crearPublicacion(app, autor.token);

        const res = await request(app)
            .delete(`/posts/${post.body.id}`)
            .set('Authorization', `Bearer ${otro.token}`);

        expect(res.status).toBe(403);
        await request(app).get(`/posts/${post.body.id}`).expect(200);
    });

    test('sin token, borrar devuelve 403', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'del_sin_token' });
        const post = await crearPublicacion(app, autor.token);

        const res = await request(app).delete(`/posts/${post.body.id}`);
        expect(res.status).toBe(403);
    });

    test('el dueño puede editar y borrar su propia publicación', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'propio_ok' });
        const post = await crearPublicacion(app, autor.token);

        const editRes = await request(app)
            .put(`/posts/${post.body.id}`)
            .set('Authorization', `Bearer ${autor.token}`)
            .send({ descripcion: 'Descripción actualizada por el dueño' });
        expect(editRes.status).toBe(200);

        const delRes = await request(app)
            .delete(`/posts/${post.body.id}`)
            .set('Authorization', `Bearer ${autor.token}`);
        expect(delRes.status).toBe(200);

        await request(app).get(`/posts/${post.body.id}`).expect(404);
    });
});
