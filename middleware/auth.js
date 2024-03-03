const jwt = require('jsonwebtoken');
const User= require('../models/user');

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
module.exports ={ authenticate};