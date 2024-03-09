const jwt = require('jsonwebtoken');
const Group=require('../models/group');
const Message= require('../models/message');

exports.creategroup = async (req, res, next) => {
    try{
        const myObj=req.body;
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
