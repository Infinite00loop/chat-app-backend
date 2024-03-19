const User=require('../models/user');
const Group=require('../models/group')
const Usergroup=require('../models/usergroup')
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');


exports.insertUser = async (req, res, next) => {
  try{
   var myObj=req.body;
   const saltrounds=10;
   bcrypt.hash(myObj.password,saltrounds,async (err,hash)=>{
    if(!err){
      myObj.password=hash;
      await User.create(myObj)
      console.log('user created');
      res.json();
    }
    else{
      console.log(err)
    }
   }) 
  }
  catch(err){
    console.log('Something went wrong',err)
  }
  };

exports.getUser= async (req,res,next)=>{
  try{
    const email=req.params.email;
    console.log(email);
    const user= await User.findAll({
        where:{
            email : email
        }
    })
    console.log('Got user details');
    console.log(user[0])
    res.json(user[0])       
  }
  catch(err){
    console.log('Something went wrong',err)
  }
}
function generateAccessToken(id, name){
    return jwt.sign({userId:id, name:name},process.env.TOKEN_SECRET)
  }
  exports.loginUser = async (req, res, next) => {
    try{
      var myObj=req.body; 
      const user= await User.findAll({
        where:{
            email : myObj.email
        }
    })
       if(user[0]==undefined){
        res.status(404).json({message:'User does not exist'})
    }
    else{
        var pass= user[0].password
        bcrypt.compare(myObj.password,pass,(err,result)=>{
          if(err){
            res.status(500).json({message:'Something went wrong'})
          }
          if(result===true){
            res.status(200).json({message:'Logged in successfully', token: generateAccessToken(user[0].id, user[0].name)})
          }
          else{
            res.status(401).json({message:'Password  incorrect'}) 
          }
        })  
    }            
    }
    catch(err){
      console.log('Something went wrong',err)
    }
   };
   exports.getallusers= async (req,res,next)=>{
    try{
      const users=await User.findAll({
        attributes: ['id', 'name', 'email','phone']
      })
      const existingusers=await Usergroup.findAll({where: { groupid: req.group.id}});
      const existinguserids = existingusers.map(usergroup => usergroup.userId);
      const usersNotInGroup = users.filter(user => !existinguserids.includes(user.id));
      console.log('users')
      console.log(usersNotInGroup)
      res.json(usersNotInGroup)     
    }
    catch(err){
        console.log('Something went wrong',err)
    }
  }
