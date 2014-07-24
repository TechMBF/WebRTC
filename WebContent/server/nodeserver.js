
var chatServer = new ChatServer();
"use strict";
//Global variables for websocket connection..
process.title = 'node-chat';
var wsPort = 1336;
var webSocketServer = require('websocket').server;
var http = require('http');

//Global variables for Functionality..
var groupList = new Array();  
var userList = Array();
//var groupMap = new Map();
var requestedJSON;
var comMasterMap = new Array();
var usrMasterMap = new Array();
var comMap = new Array();
var usrMap = new Array();
var userList = [];
var connList = new Array();
var usernameList = [];

var parentArray = new Array();
var cmnArray = new Array();
var uArray = new Array();
var nameArray = new Array();


function ChatServer(){    
}

function ChatServer(userId, userName, communityId, communityName, groupName){
    this.userId = userId;
    this.userName = userName;
    this.communityId = communityId;
    this.communityName = communityName;
    this.groupName = groupName;    
}

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {// Not important for us. We're writing WebSocket server, not HTTP server
    });
server.listen(wsPort, function() {
    console.log('======================================================================================');
    console.log((new Date()) + 'SERVER IS STARTED AND LISTENING ON PORT : '+wsPort);
    console.log('======================================================================================');
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. To be honest I don't understand why.
    httpServer: server
});

// This callback function is called every time someone tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' CLIENT IS CONNECTED FROM ORIGIN : ' + request.origin + '.');    
    var connection = request.accept(null, request.origin); 
    var userId;
    var userName;
    var communityId;
    var communityName;
    var groupName;
    var status;
    var uID;
    console.log((new Date()) + 'NEW CONNECTION IS ACCEPTED.');        
    connection.on('message', function(message) {  
        if (message.type === 'utf8') {
            var messageJSON = chatServer.parseJSON(message);      
            if (messageJSON.type === 'JOIN') {
                console.log("GONNA JOIN IN ");
                userId = messageJSON.userId;                
                userName = messageJSON.userName;
                communityId = messageJSON.communityId;
                communityName = messageJSON.communityName;
                groupName = messageJSON.groupName;
                status = messageJSON.status;                
                
                var usrObj = {
                    userId:userId,
                    userName:userName,
                    communityId:communityId,
                    communityName:communityName,
                    groupName:groupName,
                    status:status
                };                              
                chatServer.getCurrentRoom(groupName, usrObj); // to update the list.
                var reqComList;
                for(var x = 0; x<nameArray.length; x++){
                    if(nameArray[x] == groupName){                  
                        reqComList = parentArray[x];
                        break;
                    }
                }
                uID = userName+""+groupName;
                if(usernameList.indexOf(uID) > -1){
                    var index = usernameList.indexOf(uID);
                    userList[index] = usrObj;
                }else{
                    usernameList.push(uID);
                    userList.push(usrObj);
                }
                connList[uID] = connection;
                for (var i=0; i < userList.length; i++) {
                    usrObj = userList[i];	           
                    if(usrObj.groupName == groupName && usrObj.status != 'offline'){
                        var finalArray = JSON.stringify({
                            type:'CONNECTED',
                            userId:userId,
                            userName:userName, 
                            communityId:communityId,
                            communityName:communityName,
                            groupName:groupName,
                            communities: reqComList
                        });
                        connList[usernameList[i]].sendUTF(finalArray);
                    }
                }
               
            }else if (messageJSON.type == 'STATUS') {
                console.log("GONNA JOIN IN ");
                userId = messageJSON.userId;                
                userName = messageJSON.userName;
                communityId = messageJSON.communityId;
                communityName = messageJSON.communityName;
                groupName = messageJSON.groupName;
                status = messageJSON.status;                
                
                var usrObj = {
                    userId:userId,
                    userName:userName,
                    communityId:communityId,
                    communityName:communityName,
                    groupName:groupName,
                    status:status
                };                              
                chatServer.getCurrentRoom(groupName, usrObj); // to update the list.
                var reqComList;
                for(var x = 0; x<nameArray.length; x++){
                    if(nameArray[x] == groupName){                  
                        reqComList = parentArray[x];
                        break;
                    }
                }
                uID = userName+""+groupName;
                if(usernameList.indexOf(uID) > -1){
                    var index = usernameList.indexOf(userName);
                    userList[index] = usrObj;
                }else{
                    usernameList.push(uID);
                    userList.push(usrObj);
                }
                connList[uID] = connection;
                for (var i=0; i < userList.length; i++) {
                    usrObj = userList[i];	           
                    if(usrObj.groupName == groupName && usrObj.status != 'offline'){
                        var finalArray = JSON.stringify({
                            type:'STATUS',
                            userId:userId,
                            userName:userName, 
                            communityId:communityId,
                            communityName:communityName,
                            groupName:groupName,
                            communities: reqComList
                        });
                        connList[usernameList[i]].sendUTF(finalArray);
                    }
                }
               
            }else if (messageJSON.type === 'CHAT') {
                console.log('======================   GONNA START CHAT ===================================');
                console.log((new Date()) + ' : SENDER IS : '+ messageJSON.senderName + ', his sender id is : [' 
                    +messageJSON.senderId+ '], RECIPIENT IS: '+messageJSON.recipientName+', his recipient id is : ['
                    +messageJSON.recipientId+ '], Message is : '+ messageJSON.data);
                // we want to keep history of all sent messages
                var chatDetailJSON = {
                    time:(new Date()).getTime(),
                    text:messageJSON.data,
                    senderId:messageJSON.senderId, // 0 
                    senderName:messageJSON.senderName, // senthil
                    recipientId:messageJSON.recipientId, // 1
                    recipientName:messageJSON.recipientName, //felix
                    groupName:messageJSON.groupName, //felix
                    status:messageJSON.status
                };
                //                history.push(chatDetailJSON);
                // broadcast message to all connected clients
                var replyMsg = JSON.stringify({
                    type:'MESSAGE', 
                    data: chatDetailJSON
                });
                var  uIDSender = messageJSON.recipientName+messageJSON.groupName;
                console.log('list : '+connList[uIDSender]);
                console.log('recipient id : '+uIDSender);

                try{
                    connList[uIDSender].sendUTF(replyMsg); 
                    console.log('======================   GONNA END CHAT ===================================');
                }catch(e){
                    console.log(e)
                }

            }if (messageJSON.type === 'VC') {
		
		  var vcJSON = {
                    time:(new Date()).getTime(),
                    senderId:messageJSON.senderId, // 0 
                    senderName:messageJSON.senderName, // senthil
                    recipientId:messageJSON.recipientId, // 1
                    recipientName:messageJSON.recipientName, //felix
                    groupName:messageJSON.groupName, //felix
                    status:messageJSON.status,
		    stream:messageJSON.stream
                };
                //                history.push(chatDetailJSON);
                // broadcast message to all connected clients
                var replyVC = JSON.stringify({
                    type:'VC', 
                    data: vcJSON
                });
                var  uIDSender = messageJSON.recipientName+messageJSON.groupName;
                console.log('list : '+connList[uIDSender]);
                console.log('recipient id : '+uIDSender);

                try{
                    connList[uIDSender].sendUTF(replyVC); 
                    console.log('======================   GONNA END CHAT ===================================');
                }catch(e){
                    console.log(e)
                }

		}else{                
        }               
        }         
    }); // 


    // user disconnected
    connection.on('close', function(connection) {
        console.log("========================on close=============", userId);
        uID = userName+""+groupName;
        console.log(userId,"user details : ",uID);
        console.log(userName,"user details : ",uID);
        console.log(communityId,"user details : ",uID);
        console.log(communityName,"user details : ",uID);
        console.log(groupName,"user details : ",uID);
        if (uID !== -1) {
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
            console.log("removing userId "+uID); 
            var index = usernameList.indexOf(uID);           

            var usrObj = {
                userId:userId,
                userName:userName,
                communityId:communityId,
                communityName:communityName,
                groupName:groupName,
                status:'offline'
            };                              
            chatServer.getCurrentRoom(groupName, usrObj); // to update the list.
            var reqComList;
            for(var x = 0; x<nameArray.length; x++){
                if(nameArray[x] == groupName){                  
                    reqComList = parentArray[x];
                    break;
                }
            }
            
            for (var i=0; i < userList.length; i++) {
                usrObj = userList[i];	           
                if(usrObj.groupName == groupName && usrObj.status != 'offline'){
                    var finalArray = JSON.stringify({
                        type:'STATUS',
                        userId:userId,
                        userName:userName, 
                        communityId:communityId,
                        communityName:communityName,
                        groupName:groupName,
                        communities: reqComList
                    });
                    connList[usernameList[i]].sendUTF(finalArray);
                }
            }
        }
    });     
}); // End of request function...





ChatServer.prototype.parseJSON = function(jsonObject){
    var parsedJSON = '';
    try {        
        parsedJSON = JSON.parse(jsonObject.utf8Data);        
    } catch (e) {
        console.log('Problem in JSON Parsing : ', e);
    }
    return parsedJSON;
}



ChatServer.prototype.getCurrentRoom = function(roomName, userObject){   
    try{
        var isExist = false;
        console.log("Room length : ", nameArray.length)
        if(nameArray.length == 0){
            cmnArray[0] = chatServer.createCmnMembers(userObject);
            nameArray[0] = roomName;
            parentArray[0] = cmnArray;
        }else{
            for (var i = 0; i < nameArray.length; i++) {
                if(nameArray[i] == roomName)	{	
                    isExist = true;
                    break;
                }
            }

            if(isExist){
                console.log(i, "Room is exist. Array : ", parentArray[i]);
                cmnArray = parentArray[i];
                parentArray[i] = chatServer.updateRoom(userObject, cmnArray);
                cmnArray = parentArray[i];
            }else{
                cmnArray = null;
                cmnArray = new Array();
                uArray = null;
                uArray = new Array();
                console.log("Room is not exist. Array : ", parentArray[i]);
                cmnArray[0] = chatServer.createCmnMembers(userObject);
                nameArray.push(roomName);
                parentArray.push(cmnArray);
            }		
        }
    }catch(e){}
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    console.log("Name Array : ", nameArray);
    console.log("Parent Array : ", parentArray);
    console.log("Commnity Array : ", cmnArray);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    return cmnArray;
}

ChatServer.prototype.createCmnMembers = function(userObject){  
    try{ 
        console.log("\nCreate New Community. Community Name : ", userObject.communityName);
        var tempArr = {};
        tempArr['communityName'] = userObject.communityName;
        uArray.push(chatServer.createCmnUsers(userObject));
        tempArr['userArrayList'] = uArray;
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        console.log("\n return comm array : ", tempArr);	
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    }catch(e){
        console.log(e)
    }

    return tempArr;
}

ChatServer.prototype.createCmnUsers = function(userObject){  
    try{	
        console.log("Create new user.")
        var usrArr = {};
        usrArr['userId'] = userObject.userId;
        usrArr['userName'] = userObject.userName;
        usrArr['communityId'] = userObject.communityId;
        usrArr['communityName'] = userObject.communityName;
        usrArr['groupName'] = userObject.groupName;
        usrArr['status'] = userObject.status;
        console.log("\nReturn user Array is : ", usrArr);
    }catch(e){
        console.log(e)
    }
    return usrArr;
}

ChatServer.prototype.updateRoom = function(userObject, curCmnArr){  
    try{
        var isExist =false, isUsrExist = false;
        for (var i = 0; i < curCmnArr.length; i++) {
            if(curCmnArr[i].communityName == userObject.communityName){
                isExist = true;
                break;
            }
        }

        if(isExist){
            //have to write the code for user check....
            var usrList = curCmnArr[i].userArrayList;
            for (var k = 0; k < usrList.length; k++) {
                if(usrList[k].userId == userObject.userId){
                    isUsrExist = true;
                    break;
                }
            }		

            if(isUsrExist){
                console.log("User already exist...");
                var existingUArray = usrList[k];
                existingUArray.status = userObject.status;
                usrList[k] = existingUArray;
                curCmnArr[i].userArrayList = usrList;
                console.log("updated community array : ", curCmnArr);
            }else{
                console.log(curCmnArr[i].userArrayList+">>>>>>>>>>>>>> Community Exist>>>>>>>>>> Array : ", curCmnArr);
                uArray = curCmnArr[i].userArrayList;
                uArray.push(chatServer.createCmnUsers(userObject));
                curCmnArr[i].userArrayList = uArray;
            }
        }else{
            console.log(">>>>>>>>>>>>>> Community not Exist>>>>>>>>>> Array : ", curCmnArr);
            var tempArr = {};
            uArray = null;
            uArray = new Array();
            tempArr['communityName'] = userObject.communityName;
            uArray.push(chatServer.createCmnUsers(userObject));
            tempArr['userArrayList'] = uArray;

            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> old record : ", curCmnArr);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> new user : ", uArray);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> new community : ", tempArr);
            curCmnArr.push(tempArr);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> new record : ", curCmnArr);
        }
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        console.log("\n Final array : ", curCmnArr);	
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    }catch(e){
        console.log(e);
    }
    return curCmnArr;
}

