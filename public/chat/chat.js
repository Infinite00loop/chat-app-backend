const chatCards = document.getElementById('chatCards');
const tabledata=document.getElementById('tabledata');
const token=localStorage.getItem('token');
const grouptoken=localStorage.getItem('grouptoken')
const groupname=localStorage.getItem('groupname')
const invitebutton=document.getElementById('invite');
const groupheading=document.getElementById('grpname')
let isAdmin=false;
const socket = io();
socket.on('message', () => {
    console.log("hi")
    getChats();
});
groupheading.textContent=groupname
window.addEventListener('DOMContentLoaded',async ()=>{
    const response=await axios.get(`${api_endpoint}group/isgroupadmin`,{headers:{"authorization": token,"groupauthorize": grouptoken}});
    if(response.data.isAdmin){
        isAdmin=true;
        invitebutton.style.display='block';
        groupheading.classList.add('member-left-margin')
    }
    getChats();
})

async function getChats(){
    chatCards.innerHTML='';
    const localmessages=JSON.parse(localStorage.getItem(groupname));
    var lastmessageid;
    if(localmessages && localmessages.length>0){
        lastmessageid=localmessages[localmessages.length-1].id;
    }
    const response=await axios.get(`${api_endpoint}chat/get-messages`,{params: {lastmessageid : lastmessageid}, headers:{"authorization": token,"groupauthorize":grouptoken}});
    let messages=[];
    if(localmessages){
        messages=[...localmessages,...response.data.messages]
    }
    else{
        messages=response.data.messages;
    }
    localStorage.setItem(groupname,JSON.stringify(messages))
    for(var i=0;i<messages.length;i++){
        showChats(messages[i]);
    }
}

function showChats(myObj) {
    var history=''
    const card = document.createElement('div');
    card.classList.add('custom-card');

    const cardBody = document.createElement('div');

    const cardText = document.createElement('p');
    cardText.classList.add('card-text');

    if(myObj.typeofrequest=='1' || myObj.typeofrequest=='3'){
        history=myObj.name+' '+myObj.chat;
        card.classList.add("align-center");
    }
    else if(myObj.typeofrequest=='2' || myObj.typeofrequest=='4'){
        history=myObj.name+' : '+myObj.chat;
        if(myObj.name=='You'){
            card.classList.add("align-right");
        }
        else{
            card.classList.add("align-left");
        }
        cardBody.classList.add('custom-card-body');
        card.style.border = '1px solid #ccc';
    }
    if(myObj.typeofrequest=='4'){
        var chatContainer = document.createElement("div");
        chatContainer.className = "chat-container";
        const img = document.createElement('img');
        img.src = myObj.fileurl;
        img.style.maxWidth = '200px';
        var modal = document.getElementById("filemodaldiv");

        var modalImg = document.getElementById("modalfile");
        img.setAttribute('data-toggle', 'modal');
        img.setAttribute('data-target', '#filemodaldiv');
        img.onclick = function() {
            modalImg.src = myObj.fileurl;
        }
        chatContainer.appendChild(img);

        if(myObj.chat!=''){
            var textParagraph = document.createElement('p');
            textParagraph.textContent = history; 
            chatContainer.appendChild(textParagraph);
        }

        cardText.appendChild(chatContainer);
    }
    else{
        cardText.textContent=history;
    }


    cardBody.appendChild(cardText);
    card.appendChild(cardBody);

    chatCards.appendChild(card);
}

async function send(e){
    try{
       e.preventDefault();
       const chat_=document.getElementById('idk2').value;
       const fileInput = document.getElementById('idk5');
       const file = fileInput.files[0];
       document.getElementById('idk2').value='';
       fileInput.value = '';
       const formData = new FormData();
       formData.append('chat', chat_);
       formData.append('file', file);
       formData.append('typeofrequest', '2');
       console.log(formData)
       await axios.post(`${api_endpoint}chat/insert-message`,formData,{headers:{'Content-Type':'multipart/form-data',"authorization": token,"groupauthorize": grouptoken}})
       socket.emit('message');
    }
    catch(err){
       console.log('Something went wrong ', err);
    }
   }
async function sendInvite(e){
    try{
        e.preventDefault();
        var email_=document.getElementById('idk4').value;
        let myObj={
            email: email_
        }
        if(email_!=''){
            const response=await axios.post(`${api_endpoint}invite/invitemember`,myObj,{headers:{"authorization": token,"groupauthorize": grouptoken}})
            alert(response.data.message)
        }
        else{
            alert("Unable to send invite");
        }
    }
    catch(err){
        console.log('Something went wrong ', err);
    } 
}
document.getElementById('showMembersButton').addEventListener('click', function(e) {
    e.preventDefault();
    showGroupMembers();
});

async function showGroupMembers() {
    try {
        const response = await axios.get(`${api_endpoint}group/members`,{headers:{"authorization": token,"groupauthorize": grouptoken}});
        console.log(response)
        let membersList = document.getElementById('membersList');

        membersList.innerHTML = '';

        response.data.members.forEach(member => {
            let listItem = document.createElement('div');
            listItem.classList.add('member-item', 'd-flex', 'justify-content-between', 'align-items-center');

            let memberInfo = document.createElement('span');
            memberInfo.textContent = member.name + ' ' + member.phone + (member.isAdmin ? ' (Admin)' : '');
            listItem.appendChild(memberInfo);

            if(isAdmin){
                let buttonsContainer = document.createElement('div');
                buttonsContainer.classList.add('d-inline-flex');
                if(!member.isAdmin){
                    let makeAdminButton = document.createElement('button');
                    makeAdminButton.textContent = 'Make Admin';
                    makeAdminButton.classList.add('btn-sm', 'btn-info', 'make-admin-button','mr-10');
                    makeAdminButton.addEventListener('click', ()=>{
                        makeAdmin(member.id,member.name);
                    });
                    buttonsContainer.appendChild(makeAdminButton);                    
                }
                if (!member.isCurrUser) {
                    let removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.classList.add('btn-sm', 'btn-primary', 'remove-button');
                    removeButton.addEventListener('click', ()=>{
                        removeMember(member.id,member.name)
                    });
                    buttonsContainer.appendChild(removeButton);
                }
                listItem.appendChild(buttonsContainer);
            }

            membersList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching group members:', error);
    }
}

async function removeMember(userid,name){
    try{
        let myObj={
            id: userid,
            name: name
        }
        console.log(myObj)
        if(confirm(`Are you sure to remove ${name}?`)){
            const response=await axios.post(`${api_endpoint}group/removemember`,myObj,{headers:{"authorization": token,"groupauthorize": grouptoken}})
            showGroupMembers();
            getChats();
            alert(response.data.message)
        }
    }
    catch(err){
        console.log('Something went wrong ', err);
    }     
}

async function makeAdmin(userid,name){
    try{
        let myObj={
            id: userid,
            name: name
        }
        // console.log(myObj)
        if(confirm(`Are you sure to make ${name} admin?`)){
            const response=await axios.post(`${api_endpoint}group/makeadmin`,myObj,{headers:{"authorization": token,"groupauthorize": grouptoken}})
            showGroupMembers();
            alert(response.data.message)
        }
    }
    catch(err){
        console.log('Something went wrong ', err);
    }     
}

document.getElementById('exitGroupLink').addEventListener('click', function(e) {
    e.preventDefault();
    exitGroup();
});

async function exitGroup() {
    try {
        if(confirm('Are you sure to leave the group?')){
            const response = await axios.post(`${api_endpoint}group/exit`, {}, { headers: { "authorization": token, "groupauthorize": grouptoken }}); 
            alert(response.data.message);
            window.location.href='../groups/groups.html'            
        }

    } catch (error) {
        console.error('Error exiting group:', error);
    }
}
