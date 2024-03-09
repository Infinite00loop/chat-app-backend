const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Usergroup = sequelize.define('usergroup', {
 role: Sequelize.STRING
});

module.exports = Usergroup;