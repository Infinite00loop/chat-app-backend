const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Group = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  grpname: {
    type: Sequelize.TEXT,
    allowNull: false
  }
 
});

module.exports = Group;