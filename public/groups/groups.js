const tabledata=document.getElementById('tabledata');
const token=localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const groupid = urlParams.get('groupid');
const groupname = urlParams.get('groupname');

window.addEventListener('DOMContentLoaded',()=>{
    if (groupname) {
        const groupNameSpan = document.getElementById('groupNameSpan');
        groupNameSpan.textContent = groupname;
        $('#groupInvitationModal').modal('show');
    }
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
    console.log(groupName)
    localStorage.setItem('grouptoken', groupId)
    localStorage.setItem('groupname', groupName)
    
    loadChat(groupId, groupName);
    
}

function loadChat(groupId, groupName) {

    document.getElementById('chatContainer').style.display = 'block';

    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <iframe src="../chat/chat.html" width="100%" height="100%" frameborder="1"></iframe>
    `;
}

async function creategroup(e){
    try{
        e.preventDefault();
       const grpname_=document.getElementById('idk4').value;
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

   async function beAmember(e){
    try{
        e.preventDefault();
        const response=await axios.post(`${api_endpoint}invite/be-a-member`,{
            groupId: groupid
        },{headers:{"authorization": token}});
        getGroups();
        alert(response.data.message)
        window.location.href=`..${window.location.pathname}`
    }
    catch(err){
        console.log('Something went wrong ', err);
     }    
   }