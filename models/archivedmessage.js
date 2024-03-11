const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Archivedmessage = sequelize.define('archivedmessage', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  chat: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  typeofrequest: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Archivedmessage;