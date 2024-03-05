const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Usergroup = sequelize.define('usergroup', {
 hasjoined: Sequelize.BOOLEAN
});

module.exports = Usergroup;