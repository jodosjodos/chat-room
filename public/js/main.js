const chatForm=document.querySelector('#chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName= document.querySelector('#room-name');
const usersList= document.querySelector('#users');
const msg=document.querySelector('#msg');
const feedback=document.querySelector('.typing')
//get username and room from Url and
const{username, room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true,
})

//message from server
const socket=io();
//join chatroom
socket.emit('joinRoom',{username, room})

//get room and userspace
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputRoomUsers(users);
})

socket.on('message',message=>{
    console.log(message);
    outputMessage(message)
 //scroll down  to show new msg
 chatMessages.scrollTop=chatMessages.scrollHeight;
 feedback.innerHTML=''
})
//message submision
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg=e.target.elements.msg.value;
//emmit msg to server
socket.emit('chatMessage',msg);
//clear input
e.target.elements.msg.value='';
e.target.elements.msg.focus();
})


//output msg to dom
function outputMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//funcito to ouput outputRoomName
function outputRoomName(room){
    roomName.innerHTML=room;
}

//outputRoomUsers
function outputRoomUsers(users){
    usersList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join(' ')
}
    `
}
//when someone is typing 
msg.addEventListener('keypress', ()=>{
    socket.emit('typing',username)
})
//listen when typing 

socket.on('typing', (data)=>{
feedback.innerHTML=`<p><em>${data}</em> is typing message....</p>`
})
//check if user has logged in 
socket.on('errorMessage',(msg)=>{
    alert(msg)
    window.location.href='/'
})