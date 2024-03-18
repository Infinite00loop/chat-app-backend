const urlParams = new URLSearchParams(window.location.search);
const groupid = urlParams.get('groupid');
const groupname = urlParams.get('groupname');
var signuplink = document.getElementById('signuplink');

if(groupname){
    signuplink.href= `../signup/signup.html?groupid=${groupid}&groupname=${groupname}`
}
else{
    signuplink.href= `../signup/signup.html`
}
window.addEventListener('DOMContentLoaded', () => {
    if (groupname) {
        const groupNameSpan = document.getElementById('groupNameSpan');
        groupNameSpan.textContent = groupname;
        $('#groupInvitationModal').modal('show');
    }
});
async function onlogin(e){
    try{
        e.preventDefault();
        var email_=document.getElementById('idx1').value;
        var password_=document.getElementById('idx2').value;
        localStorage.clear();
       
        let myObj={
            email: email_,
            password: password_
        };
        if(email_!='' && password_!='' ){
            const res= await axios.post(`${api_endpoint}admin/login-user`,myObj)
                alert(res.data.message)
                localStorage.setItem('token', res.data.token)
                if (groupname) {
                    window.location.href= `../groups/groups.html?groupid=${groupid}&groupname=${groupname}`
                }
                else{
                    window.location.href= `../groups/groups.html`
                }
        }
        else{
            alert('Please fill the empty fields!') 
        }
    }
    catch(err){
      console.log('Something went wrong',err)
      alert(err.response.data.message)
    }     
}
