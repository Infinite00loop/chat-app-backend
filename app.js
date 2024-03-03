require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const messagesRoutes = require('./routes/messages');
const User=require('./models/user')
const Message=require('./models/message')

const app = express();
app.use(
    cors({
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST", "PUT", "DELETE"]
    })
);
app.use(bodyParser.json({ extended: false }));
app.use('/admin', adminRoutes);
app.use('/chat',messagesRoutes);

User.hasMany(Message);
Message.belongsTo(User);
// sequelize.sync({force:true})
sequelize.sync()
.then(result=>{
    //console.log(result);
    app.listen(process.env.PORT_NO || 5000);
})
.catch(err=>console.log(err));