// Se ejecuta antes de cada archivo de test. Fija las variables de entorno que
// necesita la app para arrancar (JWT_SECRET) y para usar la base sqlite en
// memoria en vez de la de desarrollo (ver src/db/config/config.js -> "test").
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_solo_para_tests';
process.env.FRONTEND_URL = 'http://localhost:5173';
