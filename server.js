const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const path = require('path');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')
const formatMessage=require('./utils/messages')
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const botName='family bot'
app.use(express.static(path.join(__dirname, 'public')));
const landingFile=path.join(__dirname,'/public/index.html');
app.get('/', function(req, res) {
    res.sendFile(landingFile)
})
//run when client connect
io.on('connection',socket=>{

     //listen to the room and loged user
   socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room)
    if(user){

        socket.join(user.room);
     
     
             //welcome current user
             socket.emit('message',formatMessage(botName,`${username} welcome to family`));
     
             
             //when user connectes
             //broadcast send message to all user expeect one who have connected
             socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`));
     
     
             //send users in room 
             io.to(user.room).emit('roomUsers',{
                 room: user.room,
                 users:getRoomUsers
                 (user.room)
             })
    }
    else {
socket.emit('errorMessage','please enter a username and select chat room')
    }
    })
    //listen for chat message

    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
    
       io.to(user.room).emit('message',formatMessage( user.username,msg))
    })

    //user typing 
    socket.on('typing',(data)=>{
       socket.broadcast.emit('typing',data)
    })
    
    //run when user logged out
    socket.on('disconnect',()=>{

        const user=userLeave(socket.id);

        if(user){
            
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has logged out`));


             //users left in room
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers
            (user.room)
        })
        }


       
     })
})
port=3000|| process.env.PORT;
server.listen(port,()=>{console.log(`server is running on ${port}`)});