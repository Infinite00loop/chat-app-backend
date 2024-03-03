const User=require('../models/user');
const bcrypt=require('bcrypt');

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
