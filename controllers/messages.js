const Sequelize = require('sequelize');
const Message=require('../models/message');
const User=require('../models/user');

exports.insertmessage = async (req, res, next) => {
    try{
        const myObj=req.body;
        const message=await Message.create(myObj)
        await message.setUser(req.user)
        await message.setGroup(req.group)
        res.json();
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};
  
  exports.getmessages= async (req,res,next)=>{
    try{
        var lastmessageid=req.query.lastmessageid;
        if(lastmessageid==undefined){
            lastmessageid=0;
        }
        const messages=await Message.findAll({
            include: [{
                model: User,
                attributes: ['name'],
            }],    
            attributes: ['id','chat', 'typeofrequest', 'userId'],
            where: {
                id: {
                    [Sequelize.Op.gt]: lastmessageid 
                },
                groupId: req.group.id
            },
            order:[['createdAt','ASC']],
        }) 
        const response=messages
        .filter(message => (message.typeofrequest=='1' || message.typeofrequest=='2' || (message.typeofrequest=='3' && req.user.id==message.userId)))
        .map(message=>({id:message.id,
            chat: message.chat,
            typeofrequest: message.typeofrequest,
            name: (message.userId==req.user.id?'You':message.user.name)
        }))
        res.json({messages: response});   
    }
    catch(err){
        console.log('Something went wrong',err)
    }
  }