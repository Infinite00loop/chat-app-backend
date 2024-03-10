const tabledata=document.getElementById('tabledata');
const token=localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const groupid = urlParams.get('groupid');
const groupname = urlParams.get('groupname');
// setInterval(()=>{
//     getChats()
// },3000);
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
    const groupCardsContainer = document.getElementById('groupCards');
    groupCardsContainer.innerHTML = '';

    groups.forEach(group => {
        const groupCard = createGroupCard(group);
        groupCardsContainer.appendChild(groupCard);
    });
}

function createGroupCard(group) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'm-2', 'p-3', 'border', 'rounded');

    const groupNameHeader = document.createElement('h5');
    groupNameHeader.textContent = group.grpname;
    groupNameHeader.classList.add('card-title');
    cardDiv.appendChild(groupNameHeader);

    const enterGroupButton = document.createElement('button');
    enterGroupButton.textContent = 'Enter Group';
    enterGroupButton.classList.add('btn', 'btn-primary', 'mt-2');
    enterGroupButton.addEventListener('click', () => enterGroup(group.id, group.grpname)); // Assuming group has an ID
    cardDiv.appendChild(enterGroupButton);

    return cardDiv;
}

async function enterGroup(groupId,groupName) {
    localStorage.setItem('grouptoken', groupId)
    localStorage.setItem('groupname', groupName)
    window.location.href=`../chat/chat.html`
}
async function creategroup(e){
    try{
        e.preventDefault();
       const grpname_=document.getElementById('idk4').value;
       await axios.post(`${api_endpoint}group/create-group`,{
           grpname: grpname_
       },{headers:{"authorization": token}})
       getGroups();
       alert('group created successfully');
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