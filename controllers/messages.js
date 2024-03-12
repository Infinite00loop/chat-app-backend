const Sequelize = require('sequelize');
const S3Service=require('../services/S3services')
const fs = require('fs');
const Message=require('../models/message');
const User=require('../models/user');

exports.insertmessage = async (req, res, next) => {
    try{
        const {chat,typeofrequest}=req.body;
        const file=req.file;
        myObj={
            chat:chat,
            typeofrequest:typeofrequest
        }
        if (file) {
            const fileData = fs.readFileSync(file.path);
            const originalFileName = file.originalname;
            const lastDotIndex = originalFileName.lastIndexOf('.');
            const fileNameWithoutExtension = originalFileName.substring(0, lastDotIndex);
            const fileExtension = originalFileName.substring(lastDotIndex + 1);
            const currentDate = new Date();
            const currentDateTime = currentDate.toLocaleString();
            const filename=fileNameWithoutExtension+currentDateTime+'.'+fileExtension
            const fileurl= await S3Service.uploadToS3(fileData, filename);
            myObj.typeofrequest='4';
            myObj.fileurl=fileurl;
            fs.unlinkSync(file.path);
            console.log(fileurl)
        }
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
            attributes: ['id','chat', 'typeofrequest', 'userId','fileurl'],
            where: {
                id: {
                    [Sequelize.Op.gt]: lastmessageid 
                },
                groupId: req.group.id
            },
            order:[['createdAt','ASC']],
        }) 
        const response=messages
        .filter(message => (message.typeofrequest=='1' || message.typeofrequest=='2' || message.typeofrequest=='4' || (message.typeofrequest=='3' && req.user.id==message.userId)))
        .map(message=>({id:message.id,
            chat: message.chat,
            fileurl: message.fileurl,
            typeofrequest: message.typeofrequest,
            name: (message.userId==req.user.id?'You':message.user.name)
        }))
        res.json({messages: response});   
    }
    catch(err){
        console.log('Something went wrong',err)
    }
  }