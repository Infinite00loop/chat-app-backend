const token=localStorage.getItem('token');

const urlParams = new URLSearchParams(window.location.search);
const groupid = urlParams.get('groupid');
let groupname = urlParams.get('groupname');

const chatCards = document.getElementById('chatCards');
const groupheading=document.getElementById('grpname');
const addMemberInput = document.getElementById('idk6');
const chatwindow=document.getElementById('chat-window');
var menuIcon = document.getElementById('menuIcon');
var menuOptions = document.getElementById('menuOptions');
const dropdown = document.getElementById('suggestions');

const inviteButton=document.getElementById('inviteButton');
const addButton=document.getElementById('add');

let isAdmin=false;
let grouptoken=localStorage.getItem('grouptoken')

let userData = [];
const socket = io();
socket.on('message', () => {
    console.log("hi")
    getChats();
});

window.addEventListener('DOMContentLoaded',async ()=>{
    if (groupname) {
        const groupNameSpan = document.getElementById('groupNameSpan');
        groupNameSpan.textContent = groupname;
        $('#groupInvitationModal').modal('show');
    }
    // getChats();
    getGroups();
})

async function getGroups(){
    const response=await axios.get(`${api_endpoint}group/get-groups`,{headers:{"authorization": token}});
    const groups=response.data;
    console.log(groups)
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    groups.forEach(group => {
        const groupCard = createGroupCard(group);
        groupList.appendChild(groupCard);
    });
}

function createGroupCard(group) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'p-2', 'rounded','whatsapp-background');

    const groupNameHeader = document.createElement('h5');
    groupNameHeader.textContent = group.grpname;
    groupNameHeader.classList.add('card-title');
    cardDiv.appendChild(groupNameHeader);

    cardDiv.addEventListener('click', () => {
        const groupList = document.getElementById('groupList');
        const allCards = groupList.querySelectorAll('.card');
        allCards.forEach((card) => {
            if (card !== cardDiv) {
                card.classList.remove('selected');
            }
        });
        cardDiv.classList.toggle('selected');
        enterGroup(group.id, group.grpname)
    });


    return cardDiv;
}

async function enterGroup(groupId,groupName) {
    chatwindow.style.display='none';
    menuOptions.style.display = 'none';
    console.log(groupName)
    localStorage.setItem('grouptoken', groupId)
    localStorage.setItem('groupname', groupName)

    groupheading.textContent=groupName
    groupname=groupName;
    grouptoken=localStorage.getItem('grouptoken');
    const response=await axios.get(`${api_endpoint}group/isgroupadmin`,{headers:{"authorization": token,"groupauthorize": grouptoken}});
    if(response.data.isAdmin){
        isAdmin=true;
        console.log("hi")
        inviteButton.style.display='block';
        addButton.style.display='block';
    }
    else{
        isAdmin=false;
    }
    chatwindow.style.display='block';

    menuIcon.addEventListener('click', function() {
        if (menuOptions.style.display === 'block') {
            menuOptions.style.display = 'none';
        } else {
            menuOptions.style.display = 'block';
        }
    });
    getChats();
    
}

async function creategroup(e){
    try{
        e.preventDefault();
       const grpname_=document.getElementById('idk9').value;
       await axios.post(`${api_endpoint}group/create-group`,{
           grpname: grpname_
       },{headers:{"authorization": token}});
       getGroups();
       alert("Group created successfully");
    }
    catch(err){
       console.log('Something went wrong ', err);
    }
   }

   function canceljoin(e){
    e.preventDefault();
    window.location.href=`..${window.location.pathname}`
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

   async function beAmember(e){
    try{
        e.preventDefault();
        const response=await axios.post(`${api_endpoint}invite/be-a-member`,{
            groupId: groupid
        },{headers:{"authorization": token}});
        getGroups();
        socket.emit('message');
        alert(response.data.message)
        window.location.href=`..${window.location.pathname}`
    }
    catch(err){
        console.log('Something went wrong ', err);
     }    
   }

   function scrolltobottom(){
    chatwindow.scrollTop=chatwindow.scrollHeight;
   }
   async function getChats(){
    chatCards.innerHTML='';
    const localmessages=JSON.parse(localStorage.getItem(groupname));
    console.log(localmessages)
    var lastmessageid;
    if(localmessages && localmessages.length>0){
        lastmessageid=localmessages[localmessages.length-1].id;
    }
    console.log(lastmessageid)
    const response=await axios.get(`${api_endpoint}chat/get-messages`,{params: {lastmessageid : lastmessageid},headers:{"authorization": token,"groupauthorize": grouptoken}});
    console.log(response)
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
    scrolltobottom()
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
    else if(myObj.typeofrequest=='2' || myObj.typeofrequest=='4' || myObj.typeofrequest=='5' || myObj.typeofrequest=='6'){
        history=myObj.name+' : '+myObj.chat;
        if(myObj.name=='You'){
            card.classList.add("align-right");
            cardBody.style.backgroundColor='#36135a';
            cardBody.style.color = 'white';
        }
        else{
            card.classList.add("align-left");
        }
        cardBody.classList.add('custom-card-body');
        card.style.border = '1px solid #ccc';
    }
    if(myObj.typeofrequest=='4' || myObj.typeofrequest=='5' || myObj.typeofrequest=='6'){
        var chatContainer = document.createElement("div");
        chatContainer.className = "chat-container";

        if(myObj.typeofrequest=='4'){
            const img = document.createElement('img');
            img.src = myObj.fileurl;
            img.style.maxWidth = '200px';
    
            var modalImg = document.getElementById("modalfile");
            img.setAttribute('data-toggle', 'modal');
            img.setAttribute('data-target', '#filemodaldiv');
            img.onclick = function() {
                modalImg.src = myObj.fileurl;
            }
            chatContainer.appendChild(img);    
        }else if(myObj.typeofrequest=='5'){
            const video = document.createElement('video');
            video.src = myObj.fileurl;
            video.controls = true;
            video.style.maxWidth = '200px';
        
            chatContainer.appendChild(video);
        }
        else if(myObj.typeofrequest=='6'){
            const audio = document.createElement('audio');
            audio.src = myObj.fileurl;
            audio.controls = true; 
            audio.style.maxWidth = '200px';
        
            cardText.appendChild(audio);
        }

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
            getGroups();
            window.location.href='../groups/groups.html'            
        }

    } catch (error) {
        console.error('Error exiting group:', error);
    }
}

async function fetchUserData() {
    try {
        const response = await axios.get(`${api_endpoint}admin/getallusers`,{headers:{"authorization": token,"groupauthorize": grouptoken}});
        userData= response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return [];
    }
}

function filterUserData(userData, searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    return userData.filter(user => {
        return (
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone.includes(searchTerm)
        );
    });
}

function displaySuggestions(suggestions) {
    if(dropdown){
        dropdown.innerHTML=''
    }
    dropdown.classList.add('dropdown');

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu', 'show');

    suggestions.forEach(user => {
        const suggestionItem = document.createElement('a');
        suggestionItem.classList.add('dropdown-item');
        suggestionItem.textContent = user.name+'-'+user.email;
        suggestionItem.setAttribute('userid', user.id);
        suggestionItem.addEventListener('click', ()=> {
            insertMember(user.name, user.id);
            dropdown.remove(); 
        });
        dropdownMenu.appendChild(suggestionItem);
    });

    dropdown.appendChild(dropdownMenu);
}
function insertMember(userName, userId) {
    addMemberInput.value = userName;
    addMemberInput.setAttribute('userid', userId); 
}

document.getElementById('idk6').addEventListener('input', async function(event) {
    const searchTerm = event.target.value.trim();
    if (searchTerm === '') {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    console.log(userData)
    const filteredData = filterUserData(userData, searchTerm);
    displaySuggestions(filteredData);
});

document.getElementById('add').addEventListener('click', function(e) {
    e.preventDefault();
    addMemberInput.value='';
    if(dropdown){
        dropdown.innerHTML=''
    }
    fetchUserData();
});

async function addMember(e){
    try{
        e.preventDefault();
        const userid=addMemberInput.getAttribute('userid');
        const response=await axios.post(`${api_endpoint}invite/add-member`,{
            userid: userid
        },{headers:{"authorization": token,"groupauthorize": grouptoken}});
        getChats();
        alert(response.data.message)

    }
    catch (error) {
        console.error('Error fetching user data:', error);
        return [];
    }
}