const { v4: uuidv4 } = require('uuid');
exports.creategroup = async (req, res, next) => {
    try{
        const myObj=req.body;
        const uuid=uuidv4();
        myObj.uuid=uuid;
        await req.user.createGroup(myObj);
        res.json();
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};