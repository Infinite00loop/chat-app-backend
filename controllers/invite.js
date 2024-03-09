const Sib=require('sib-api-v3-sdk');
const Group=require('../models/group')
const Message=require('../models/message');
exports.invitemember = async (req, res, next) => {
    try{
        const groups = await req.user.getGroups({
            through: {where: {groupId: req.group.id,role: 'admin'}}
        });
        if(groups.length==0){
            res.json({message : "You are not admin of the group. Please don't be oversmart!"})
        }
        const memberemail=req.body.email;
        const groupid=req.group.uuid;
        const client=Sib.ApiClient.instance
        const apiKey=client.authentications['api-key']
        console.log('API Key:', process.env.API_KEY);
        apiKey.apiKey=process.env.API_KEY
        const tranEmailApi=new Sib.TransactionalEmailsApi();
        const hostname=(req.hostname==='localhost'?'127.0.0.1:5000':req.hostname)
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
            textContent:`Follow the link to join my group. {{params.joinurl}}`,
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
        const hostname=(req.hostname==='127.0.0.1'?'127.0.0.1:5500':req.hostname)
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
        }
                  
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};
exports.beAmember = async (req, res, next) => {
    try{
        const groupUid=req.body.groupId;
        const group = await Group.findOne({
            where: {
                uuid: groupUid
            }
        })
        const isMember=await req.user.getGroups({ where: { id : group.id} })
        console.log(isMember)
        if(isMember.length>0)(
            res.json({message: `You are already a member of ${group.grpname} group.`})
        )
        else{
            await req.user.addGroup(group,{through : {role: 'member'}})
            const message=await Message.create({
                chat: 'joined',
                typeofrequest: '1'
            })
            await message.setUser(req.user)
            await message.setGroup(group)
            res.json({message: `Joined ${group.grpname} group.`})
        }
    }
    catch(err){
      console.log('Something went wrong',err)
      res.json({message:'Something went wrong'+err})
    }
};