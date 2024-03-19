const Message=require('../models/message');
const User=require('../models/user');
const Sequelize=require('sequelize');
const sequelize = require('../util/database');
const S3Service=require('../services/S3services')
const fs = require('fs');

exports.insertmessage = async (req, res, next) => {
    const t=await sequelize.transaction();
    try{
        const {chat,typeofrequest}=req.body;
        const file=req.file;
        console.log(file)
        myObj={
            chat:chat,
            typeofrequest:typeofrequest
        }
        if (file) {
            const fileData = fs.readFileSync(file.path);
            const mimeType=file.mimetype;
            const originalFileName = file.originalname;
            const lastDotIndex = originalFileName.lastIndexOf('.');
            const fileNameWithoutExtension = originalFileName.substring(0, lastDotIndex);
            const fileExtension = originalFileName.substring(lastDotIndex + 1);
            const currentDate = new Date();
            const currentDateTime = currentDate.toLocaleString();
            const filename=fileNameWithoutExtension+currentDateTime+'.'+fileExtension
            const fileurl= await S3Service.uploadToS3(fileData, filename);
            if (mimeType.startsWith('image/')) {
                myObj.typeofrequest='4';
            }else if (mimeType.startsWith('video/')) {
                myObj.typeofrequest='5';
            }else if (mimeType.startsWith('audio/')) {
                myObj.typeofrequest='6';
            }
            myObj.fileurl=fileurl;
            fs.unlinkSync(file.path);
            console.log(fileurl)
        }
        const message=await Message.create(myObj,{transaction : t})
        await message.setUser(req.user,{transaction : t})
        await message.setGroup(req.group,{transaction : t})
        await t.commit();
        res.json();
    }
    catch(err){
      await t.rollback();
      console.log('Something went wrong',err);
      res.json({message:'Something went wrong'+err});
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
            attributes: ['id', 'chat', 'fileurl', 'typeofrequest', 'userId'],
            where: {
                id: {
                    [Sequelize.Op.gt]: lastmessageid 
                },
                groupId: req.group.id
            },
            order:[['createdAt','ASC']],
        }) 
        const response=messages
        .filter(message => (message.typeofrequest=='1' || message.typeofrequest=='2' || message.typeofrequest=='4' || message.typeofrequest=='5' || message.typeofrequest=='6' ||(message.typeofrequest=='3' && req.user.id==message.userId)))
        .map(message=>({
            id: message.id,
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