'use strict';
/** @type {import('sequelize-cli').Migration} */
// Nota: en este proyecto el esquema real se aplica via sequelize.sync() al
// arrancar el server (ver src/app.js), no via sequelize-cli db:migrate. Esta
// migracion documenta el esquema por las dudas de que en algun momento se
// migre a un flujo basado en migraciones reales.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notificacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Usuarios', key: 'id' }
      },
      actorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Usuarios', key: 'id' }
      },
      tipo: {
        allowNull: false,
        type: Sequelize.STRING
      },
      publicacionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Publicacions', key: 'id' }
      },
      comentarioId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'Comentarios', key: 'id' }
      },
      leida: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notificacions');
  }
};
