var socket = io();
var receiverName;
var receiverId;
var message;
var messages=[];
var notificationUserId=[];
var counter=[];
var users={};

$(document).ready(function(){
    makeTemplates();

var screen1= new function(){
    this.show= function(){
        render('.lowerWindowContainer','enterName','','', function(){
            var req=JSON.parse(JSON.stringify(users));
            bind('.nextScreenName', function(){
                var name=$('.userNameScreen').val();
                if(name==''){
                    if(!req.name){
                        alert("Enter something first");
                    }
                    else{
                        var temp={};
                        temp.next=screen2;
                        updateScreens(req,temp.next);
                    }
                }
                else{
                  req.name=name;
                  var temp={};
                  temp.next=screen2;
                  updateScreens(req,temp.next);
                }
            });
        });
    }
}

screen1.show();

var screen2= new function(){
    this.show= function(req2){
        render('.lowerWindowContainer','enterAvatar',req2,'', function(){
            var temp={};
            var avatarId; 
            var req=JSON.parse(JSON.stringify(users));
            bind('.avatar1Screen', function(){
                avatarId=1;
                $('.rightAvatarScreen').hide();
            });
            bind('.avatar2Screen', function(){
                avatarId=2;
                $('.rightAvatarScreen').hide();
            });
            bind('.avatar3Screen', function(){
                avatarId=3;
                $('.rightAvatarScreen').hide();
            });
            bind('.avatar4Screen', function(){
                avatarId=4;
                $('.rightAvatarScreen').hide();
            }); 
            bind('.nextScreenAvatar', function(){
                if(!avatarId){
                    if(!req.avatarId){
                        alert("please select an avatar first");
                    }
                    else{
                        temp.next=screen3;
                        updateScreens(req,temp.next);
                    }
                }
                else{
                    temp.next=screen3;
                    req.avatarId=avatarId;
                    updateScreens(req,temp.next);
                }
            });
            bind('.backNameScreen', function(){
                temp.back=screen1;
                updateScreens(req,temp.back);
            });
        });
    }
}

var screen3= new function(){
    this.show= function(req2){
        render('.lowerWindowContainer','enterEmail',req2,'', function(){
            //console.log(req2);
            var temp={};
            var req=JSON.parse(JSON.stringify(users));
            bind('.backAvatarScreen', function(){
                temp.back=screen2;
                updateScreens(req,temp.back);
            })
            bind('.nextScreenEmail', function(){
                var email=$('.userEmailScreen').val();
                if(email==''){
                    alert('please enter your E-mail Id first');
                }
                else{
                    req.email=email;
                    temp.next=screen4;
                    updateScreens(req,temp.next);
                }
            });
        });
    }
}

var screen4= new function(){
    this.show= function(req2){
        render('.lowerWindowContainer','finalScreen',req2,'', function(){
            var req=JSON.parse(JSON.stringify(users));
            bind('.startChat', function(){
                openChatWindow();
            });
        });
    }
}

function updateScreens(req,temp){
    users.name=req.name;
    users.email=req.email;
    users.avatarId=req.avatarId;
    if(req.avatarId==1){
        users.avatarUrl="url('../img/avatarIcon1.png')";
        req.avatarUrl="url('../img/avatarIcon1.png')";
    }
    else if(req.avatarId==2){
        users.avatarUrl="url('../img/avatarIcon2.png')";
        req.avatarUrl="url('../img/avatarIcon2.png')";
    }
    else if(req.avatarId==3){
        users.avatarUrl="url('../img/avatarIcon3.png')";
        req.avatarUrl="url('../img/avatarIcon3.png')";
    }
    else if(req.avatarId==4){
        users.avatarUrl="url('../img/avatarIcon4.png')";
        req.avatarUrl="url('../img/avatarIcon4.png')";
    }
    switch(temp){
        case screen1: {
            screen1.show();
            break;
        }
        case screen2: {
            screen2.show(req);
            break;
        }
        case screen3: {
            screen3.show(req);
            break;
        }
        case screen4: {
            screen4.show(req);
            break;
        }
        default: {
            alert('smthing wrong');
            break;
        }
    }
}

socket.on('getName', function(jsonArray){
    var i=0;
      while(i<jsonArray.length){
        if(jsonArray[i].userId == socket.id){
          break;
        }
        i++;
      }
      jsonArray.splice(i,1);
       
   render('.onlineContacts','online',jsonArray,'', function(){
      bind('.contactName', function(){
          var bufferJson=[];
          var check=0;
          for(var i=0;i<messages.length;i++){
          if(($(this).data("id")==messages[i].sender && socket.id==messages[i].receiver) || (messages[i].sender==socket.id && messages[i].receiver==$(this).data("id"))){
                  check=1;
                  break;
              }
          }
          if(check==1){
              $('.rightContainer').show();
              var notificationId=$(this).data("id");
              var counterRemoveId=notificationId+'span';
              for(var i=0;i<messages.length;i++){
                if($(this).data("id")==messages[i].sender && socket.id==messages[i].receiver){
                  bufferJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextReceiver"});
                  receiverId=messages[i].sender;
                  receiverName=messages[i].senderName;
                }
                if(messages[i].sender==socket.id && messages[i].receiver==$(this).data("id")){
                   bufferJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextSender"});
                   receiverId=messages[i].receiver;
                   receiverName=messages[i].receiverName;
                }
              }
              renderChat(bufferJson);
              removeNotification(notificationId,counterRemoveId);
           }
          else{
              receiverName=$(this).data("name");
              receiverId=$(this).data("id");
              $('.rightContainer').show();
              $('.chatMessages .chatMessagesContainer').html('');
          }
          var contactPic=$(this).data("picture");
          $('.contactInfo .contactNameContainer').html($(this).data("name"));
          changeContactsPic(contactPic);
          $(this).css("background-color", "#ecf0f1");
          $('.'+counterRemoveId).html('');
          console.log('it runs');
      });
      if(counter.length>0){
          console.log("render");
          updateNotifyCount(counter);
      }
      if(notificationUserId.length>0){
          giveNotification(notificationUserId);
      }
      
   });
  });

  $(".msgInputArea .inputMessage").keyup(function(e){
      if(e.keyCode==13){
          var buffJson=[];
          message=$('.inputMessage').val();
          $('.inputMessage').val('');
          //alert(receiverName);
          messages.push({"message":message, "sender":socket.id, "senderName":users.name, "receiver":receiverId, "receiverName":receiverName});
          for(var i=0;i<messages.length;i++){
             if(socket.id==messages[i].sender && messages[i].receiver==receiverId){
                      buffJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextSender"});
                  }
             if(messages[i].sender==receiverId && messages[i].receiver==socket.id){
                 buffJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextReceiver"});
             }
              }
          renderChat(buffJson);
          socket.emit('connectPeers',messages);
      }
  });
  
  socket.on('connectPeers', function(data){
    var tempJson=[];
    messages.push({"message":data[data.length-1].message, "sender":data[data.length-1].sender, "senderName":data[data.length-1].senderName, "receiver":data[data.length-1].receiver, "receiverName":data[data.length-1].receiverName});
    if(receiverName==data[data.length-1].senderName){
        for(var i=0; i<messages.length; i++){
        if(messages[i].sender==data[data.length-1].sender && messages[i].receiver==data[data.length-1].receiver){
            tempJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextReceiver"});
          }
        if(messages[i].sender==data[data.length-1].receiver && messages[i].receiver==data[data.length-1].sender){
            tempJson.push({"message":messages[i].message, "sender":messages[i].sender, "receiver":messages[i].receiver, "className":"chatTextSender"});
        }
        }
        renderChat(tempJson);
    }
    else{
        notificationUserId.push(data[data.length-1].sender);
        giveNotification(notificationUserId);
        
        if($('.'+data[data.length-1].sender+'span').html()==''){
            counter.push({"notifyId":data[data.length-1].sender+'span', "count":1});    
            updateNotifyCount(counter);
        }
        else{
            var notifyCount=$('.'+data[data.length-1].sender+'span').html();
            counter.push({"notifyId":data[data.length-1].sender+'span', "count":++notifyCount});
            updateNotifyCount(counter);
        }
    }
  });

  bind('.userInfo', function(){
      if($('.userData').css('display')=='none'){
        $('.onlineContacts').hide();
        render('.userData','showUserData',users,'', function(){
            bind('.showName', function(){
                alert('working');
            });
        });
        $('.userData').show();
      }
      else{
        $('.onlineContacts').show();
        $('.userData').hide()
      }
      //$('.onlineContacts').hide();
      //$('.userData').show();
  });

  bind('.contactInfo', function(){
      if($('.contactProfile').css('display')=='none'){
         $('.chatMessagesContainer').hide();
         render('.contactProfile','showContactData',users,'', function(){
             bind('.showContactInfo', function(){
                 alert('working');
             });
         });
         $('.contactProfile').show();
      }
      else{
          $('.contactProfile').hide();
          $('.chatMessagesContainer').show();
      }
  });




  //functions start here

  function renderChat(messages){
      render('.chatMessages .chatMessagesContainer','chat',messages,'');
  }

  function giveNotification(notificationUserId){
      //console.log(notificationUserId);
      for(var i=0; i<notificationUserId.length; i++){
          $('.'+notificationUserId[i]).css("background-color", "#4c4cff");
      }
  }

  function changeContactsPic(contactPic){
      $('.contactInfo .contactPicContainer').css("background-image", contactPic);
  }

  function removeNotification(notificationId, counterRemoveId){
      //console.log("before splice"+notificationUserId.length);
      //console.log(notificationUserId+" "+notificationId);
      var p=0;
      var q=0;
          while(p<notificationUserId.length){
              if(notificationUserId[p]==notificationId){
                  break;
              }
              p++;
          }
          notificationUserId.splice(p,1);

          while(p<counter.length){
              if(counter[q].notifyId==counterRemoveId){
                  break;
              }
              q++;
          }
          counter.splice(q,1);
          //console.log("after splice"+notificationUserId.length);
  }

  function updateNotifyCount(counter){
      for(var i=0; i<counter.length; i++){
          $('.contactContainer .counterContainer .'+counter[i].notifyId).html(counter[i].count);
          console.log("looping");
      }
      console.log(counter); 
  }

  function openChatWindow(){
      $('.userInfo .userNameContainer').html(users.name);
      $('.titleName').html(users.name+" -"+$(document).attr('title'));
      $('.loginContainer').hide();
      $('.container').show();
      $('.userInfo .userPicContainer').css("background-image", users.avatarUrl);
      socket.emit('getName',users.name,socket.id,users.avatarUrl);
  }

});