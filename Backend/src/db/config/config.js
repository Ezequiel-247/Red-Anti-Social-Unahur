require('dotenv').config();

module.exports = {
    development: {
        storage: "src/datos/tp.sqlite",
        dialect: "sqlite",
        logging: false
    },
    test: {
        storage: ":memory:",
        dialect: "sqlite",
        logging: false
    },
    production: {
        use_env_variable: "DATABASE_URL",
        dialect: "postgres",
        dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
        }
    }
};