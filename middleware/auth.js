const jwt = require('jsonwebtoken');
const User= require('../models/user');
const Group= require('../models/group');

const authenticate= async (req, res, next) =>{
    try{
        const token=req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(user.userId)
        const userd= await User.findByPk(user.userId)
            req.user = userd;
            next();
    }
    catch(err){
      console.log('Something went wrong',err)
    }
}

const authenticategroup= async (req, res, next) =>{
  try{
      const grouptoken=req.header('groupauthorize');
      console.log(grouptoken);
      const group = jwt.verify(grouptoken,process.env.TOKEN_SECRET);
      console.log(group.grpId)
      const currgroup= await Group.findByPk(group.grpId)
          req.group = currgroup;
          next();
  }
  catch(err){
    console.log('Something went wrong',err)
  }
}
module.exports ={ authenticate, authenticategroup};