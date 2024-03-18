const Sib=require('sib-api-v3-sdk');
const User=require('../models/user')
const Group=require('../models/group')
const Message=require('../models/message');
const sequelize = require('../util/database');
exports.invitemember = async (req, res, next) => {
    try{
        if(!req.isAdmin){
            res.json({message : "You are not admin of the group. Please don't be oversmart!"})
        }
        const memberemail=req.body.email;
        const groupid=req.group.uuid;
        const client=Sib.ApiClient.instance
        const apiKey=client.authentications['api-key']
        apiKey.apiKey=process.env.API_KEY
        const tranEmailApi=new Sib.TransactionalEmailsApi();
        const hostname=(req.hostname==='localhost'?'localhost:3000':req.hostname)
        const url=`http://${hostname}/invite/joingroup/`+groupid;
        console.log(url)
        const sender={
            email: req.user.email,
        }
        const receivers=[
            {
                email: memberemail,
            }
        ]
        const result=await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: `Join my group`,
            textContent: `Follow the link to join my group. {{params.joinurl}}`,
            params:{
                joinurl: url,
            }
        })
        res.json({message : "Invite sent successfully"});
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};

exports.joingroup = async (req, res, next) => {
    try{
        const uuid=req.params.uuid;
        const hostname=(req.hostname==='localhost'?'localhost:3000':req.hostname)
        const group=await Group.findOne({
            where:{
                uuid:uuid
            }
        })
        if(group){
            res.redirect(`http://${hostname}/login/login.html?groupid=${uuid}&groupname=${group.grpname}`)
        }
        else{
            console.log("Group not found");
            res.send('Group not found');
        }
                  
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};

exports.beAmember = async (req, res, next) => {
    const t=await sequelize.transaction();
    try{
        const groupUid=req.body.groupId;
        const group = await Group.findOne({
            where: {
                uuid: groupUid
            }
        },{transaction : t})
        const isMember=await req.user.getGroups({ where: { id : group.id} },{transaction : t})
        console.log(isMember)
        if(isMember.length>0){
            await t.commit();
            res.json({message: `You are already a member of ${group.grpname} group.`})
        }
        else{
            await req.user.addGroup(group,{through : {role: 'member'},transaction : t})
            const message=await Message.create({
                chat: `joined`,
                typeofrequest: '1'
            },{transaction : t})
            await message.setUser(req.user,{transaction : t})
            await message.setGroup(group,{transaction : t})
            await t.commit();
            res.json({message: `Joined ${group.grpname} group.`})
        }
    }
    catch(err){
      await t.rollback();
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};

exports.addmember = async (req, res, next) => {
    const t=await sequelize.transaction();
    try{
        if(!req.isAdmin){
            res.json({message : "You are not admin of the group. Please don't be oversmart!"})
        }
        const userid=req.body.userid;
        const user = await User.findOne({
            where: {
                id: userid
            }
        },{transaction : t})
        const isMember=await user.getGroups({ where: { id : req.group.id} },{transaction : t})
        if(isMember.length>0){
            await t.commit();
            res.json({message: `You are already a member of ${group.grpname} group.`})
        }
        else{
            await user.addGroup(req.group,{through : {role: 'member'},transaction : t})
            const message=await Message.create({
                chat: `added ${user.name}`,
                typeofrequest: '1'
            },{transaction : t})
            await message.setUser(req.user,{transaction : t})
            await message.setGroup(req.group,{transaction : t})
            await t.commit();
            res.json({message: `You added ${user.name}`})
        }
    }
    catch(err){
      await t.rollback();
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};