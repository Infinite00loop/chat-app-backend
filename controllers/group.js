const Usergroup=require('../models/usergroup');
const User=require('../models/user');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Group=require('../models/group');
const Message= require('../models/message');

exports.creategroup = async (req, res, next) => {
    try{
        const myObj=req.body;
        const uuid=uuidv4();
        myObj.uuid=uuid;
        const group= await req.user.createGroup(myObj);
        await req.user.addGroup(group, {through:{role:'admin'}})
        const message=await Message.create({
          chat: `created group "${myObj.grpname}"`,
          typeofrequest: '1'
      })
      await message.setUser(req.user)
      await message.setGroup(group)
        res.json();
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};
function generateAccessToken(id){
  return jwt.sign({grpId:id},process.env.TOKEN_SECRET)
}
exports.getgroups = async (req, res, next) => {
  try{
     const groups= await req.user.getGroups();
     const response=groups.map(group=>({
      id: generateAccessToken(group.id),
      grpname: group.grpname
  }))
  res.json(response);
  }
  catch(err){
    console.log('Something went wrong',err)
    res.json({message:'Something went wrong'+err})
  }
};
exports.isgroupadmin = async (req, res, next) => {
  res.json({isAdmin : req.isAdmin})
};
exports.getmembers = async (req, res, next) => {
  try{
      const members = await req.group.getUsers();
      const response=members.map(member=>({
          id: member.id,
          name: member.name,
          phone: member.phone,
          isAdmin: (member.usergroup.role=='admin'?true:false),
          isCurrUser: (req.user.id==member.id?true:false)
      }))
      res.json({members:response});
  }
  catch(err){
    console.log('Something went wrong',err)
    res.json({message:'Something went wrong'+err})
  }
};

exports.removemember = async (req, res, next) => {
  try{
      if(!req.isAdmin){
          res.json({message : "You are not admin of the group. Please don't be oversmart!"})
      }
      const {id,name}=req.body;
      const userGroupRecord = await Usergroup.findOne({ where: { UserId: id, GroupId: req.group.id } });
      if (userGroupRecord) {
          await userGroupRecord.destroy();
          const message=await Message.create({
              chat: `removed ${name}`,
              typeofrequest: '1'
          })
          await message.setUser(req.user)
          await message.setGroup(req.group)
          res.json({message: `${name} was removed.`})
      }
      else{
          res.json({message: `${name} not found.`})  
      }    
  }
  catch(err){
    console.log('Something went wrong',err)
    res.json({message:'Something went wrong'+err})
  }
};

exports.makeadmin = async (req, res, next) => {
  try{
      if(!req.isAdmin){
          res.json({message : "You are not admin of the group. Please don't be oversmart!"})
      }
      const {id,name}=req.body;
      const userGroupRecord = await Usergroup.findOne({ where: { UserId: id, GroupId: req.group.id } });
      if (userGroupRecord) {
          userGroupRecord.role='admin'
          await userGroupRecord.save();
          const message=await Message.create({
              chat: `are now an admin`,
              typeofrequest: '3'
          })
          const memberToBeAdmin=await User.findOne({where:{id: id}});
          await message.setUser(memberToBeAdmin)
          await message.setGroup(req.group)
          res.json({message: `${name} is an admin now.`})
      }
      else{
          res.json({message: `${name} not found.`})  
      }    
  }
  catch(err){
    console.log('Something went wrong',err)
    res.json({message:'Something went wrong'+err})
  }
};

exports.exitgroup = async (req, res, next) => {
  try{
      const userGroupRecord = await Usergroup.findOne({ where: { UserId: req.user.id, GroupId: req.group.id } });
      if (userGroupRecord) {
          await userGroupRecord.destroy();
          const message=await Message.create({
              chat: 'left',
              typeofrequest: '1'
          })
          await message.setUser(req.user)
          await message.setGroup(req.group)
          res.json({message: `You left the group.`})
      }
      else{
          res.json({message: `You are not a member of the group.`})  
      }    
  }
  catch(err){
    console.log('Something went wrong',err)
    res.json({message:'Something went wrong'+err})
  }
};
