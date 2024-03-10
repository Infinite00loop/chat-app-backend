const urlParams = new URLSearchParams(window.location.search);
const groupid = urlParams.get('groupid');
const groupname = urlParams.get('groupname');
var loginlink = document.getElementById('loginlink');

if(groupname){
    loginlink.href=`../login/login.html?groupid=${groupid}&groupname=${groupname}`
}
else{
    loginlink.href=`../login/login.html`
}
async function onsignup(e){
    e.preventDefault();
    var name_=document.getElementById('id1').value;
    var email_=document.getElementById('id2').value; 
    var phone_=document.getElementById('id3').value;
    var password_=document.getElementById('id4').value;
   
    let myObj={
        name: name_,
        email: email_,
        password: password_,
        phone: phone_
    };
        if(name_!='' && email_!='' && password_!='' && phone_!=''){
            try{
                const result= await axios.get(`${api_endpoint}admin/get-user/${email_}`);
                if(result.data==""){
                   await axios.post(`${api_endpoint}admin/insert-user`,myObj)
                   alert('signed up successfully')
                   if (groupname) {
                    window.location.href=`../login/login.html?groupid=${groupid}&groupname=${groupname}`
                }
                else{
                    window.location.href=`../login/login.html`
                }                }
                else{
                    alert('User already exists')
                }

            }
            catch(err){
                console.log(err);
            }
           
        }
        else{
            alert('Please fill the empty fields!')
        }
       
}
