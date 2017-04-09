var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path=require('path');
var jsonArray=[];
var user;
var contact;

app.get('/', function(req, res){
  res.sendFile(__dirname+'/view/index.html');
});

app.use(express.static(path.join(__dirname,'public')));

var count=0;
io.on('connection', function(socket){

  socket.on('getName',function(user_name,userId,picUrl){
    console.log('a user connected');
    count++;
    jsonArray.push({"name":user_name,"userId":userId, "picBackground":picUrl});
    console.log(jsonArray);
    io.emit('getName',jsonArray);
  });

  socket.on('connectPeers',function(messages){
    socket.to(messages[messages.length-1].receiver).emit('connectPeers',messages);
  });

  socket.on('disconnect', function(){
    for(var i=0;i<jsonArray.length;i++){
        if(socket.id==jsonArray[i].userId){
          jsonArray.splice(i,1);
          io.emit('getName',jsonArray);
          count--;
          console.log('user disconnected');
          break;
        }
      }
  });
});

http.listen(3000, function(){
    console.log('listening on *3000');
});