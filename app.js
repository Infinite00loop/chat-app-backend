require('dotenv').config();
const socketIo=require('socket.io');
const http=require('http')
const path= require('path');
const fs= require('fs')
const helmet= require('helmet');
const compression= require('compression')
const morgan= require('morgan')
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const cors = require('cors');
const cron = require('cron');
const Sequelize=require('sequelize');
const nightlyJob = new cron.CronJob('0 0 * * *', async () => {
    try {
      // Find messages older than one minute
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oldMessages = await Message.findAll({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: oneDayAgo,
          },
        },
      });
  
      // Move old messages to ArchivedMessage table
      await Archivedmessage.bulkCreate(oldMessages.map(message => ({
        id:message.id,
        userId: message.userId,
        groupId: message.groupId,
        chat: message.chat,
        typeofrequest: message.typeofrequest,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })));
  
      // Delete old messages from Message table
      await Message.destroy({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: oneDayAgo,
          },
        },
      });
      console.log('Cron job ran successfully at:', new Date());
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  }, null, true, 'UTC'
);


nightlyJob.start();


const accessLogStream= fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}
);
const adminRoutes = require('./routes/admin');
const messagesRoutes = require('./routes/messages');
const groupRoutes = require('./routes/group');
const inviteRoutes = require('./routes/invite');
const User=require('./models/user')
const Message=require('./models/message')
const Group=require('./models/group')
const Usergroup=require('./models/usergroup')
const Archivedmessage=require('./models/archivedmessage')

const app = express();
app.use(express.static('public'));
// app.use(
//     cors({
//         // origin: "http://127.0.0.1:5500",
//         methods: ["GET", "POST", "PUT", "DELETE"]
//     })
// );
//app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.json({ extended: false }));
app.use('/admin', adminRoutes);
app.use('/chat',messagesRoutes);
app.use('/group',groupRoutes);
app.use('/invite',inviteRoutes);
app.use((req,res)=>{
    const hostname=(req.hostname==='localhost'?'localhost:3000':req.hostname)
    res.redirect(`http://${hostname}/login/login.html`);
})

Group.belongsToMany(User,{through:Usergroup});
User.belongsToMany(Group,{through:Usergroup});
Message.belongsTo(User);
Message.belongsTo(Group);
Archivedmessage.belongsTo(User);
Archivedmessage.belongsTo(Group);
const server = http.createServer(app);

const io=socketIo(server);
io.on('connection',(socket)=>{
    console.log('hi')
    socket.on('message',()=>{
        io.emit('message')
    })
})
//sequelize.sync({force:true})
sequelize.sync()
.then(result=>{
    //console.log(result);
    server.listen(process.env.PORT_NO || 3000);
})
.catch(err=>console.log(err));