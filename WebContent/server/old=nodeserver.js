// chat-server.js
// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";
// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';
// Port where we'll run the websocket server
var webSocketsServerPort = 1336;
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// entire message history
var history = new Array();
// list of currently connected clients (users)
var clients = new Array();

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
var userids = [ 0, 1, 2, 3, 4, 5, 6, 7];
var userList = new Array();

// ... in random order
colors.sort(function(a,b) {return Math.random() > 0.5;} );

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log('======================================================================================');
    console.log((new Date()) + 'SERVER IS STARTED AND LISTENING ON PORT : '+webSocketsServerPort);
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
    // accept connection
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userIndex = -1;
    var userName = false;
    var userColor = false;
    var userId = -1;
    var	user;
    var nickName;
    var password;
    var status;
    console.log((new Date()) + 'NEW CONNECTION IS ACCEPTED.');
    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( {type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {        
        if (message.type === 'utf8') { // accept only text
            var jsonMsg = '';
             try {
                    console.log('onMessage function is called : '+message.utf8Data);
		     jsonMsg = JSON.parse(message.utf8Data);
                     console.log('json type : '+jsonMsg.type);
                } catch (e) {
                    console.log('This doesn\'t look like a valid JSON: ', message.data);
                }

            if (jsonMsg.type === 'JOIN') {
		console.log('======================   GONNA JOIN IN ROOM  ===================================');
		console.log(jsonMsg.data+' is Joined into the default Room.');
		user = jsonMsg.user;
		userName = jsonMsg.userName; 
		nickName = jsonMsg.nickName;  
		password = jsonMsg.password;  
		status = jsonMsg.status;	        
                userId = userids.shift();
               var obj = {
                    userId: userId,
                    userName : userName,
		    user:user,
		    nickName:nickName,
	            status:status
                };
                userIndex = userList.push(obj) - 1;
		var loginedUsersJSON = JSON.stringify({
					type:'CONNECTED',
					userId:userId,
				        user:user, 
					userName:userName,
					nickName:nickName,
					password:password,
					userList: userList
					});
		//Send update logined user list to every user
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(loginedUsersJSON);
                }
		//have to send to all the logined users ...              
                console.log((new Date()) + ' User is known as : ' + userName + ' id :'+userId+' with ' + userColor + ' color.');
		console.log('======================   NEW USER JOINED IN DEFAULT ROOM   ===================================');
            } else if (jsonMsg.type === 'STATUS') {
		console.log('======================   GONNA CHANGE STATUS ===================================');
		user = jsonMsg.user;
		userName = jsonMsg.userName; 
		nickName = jsonMsg.nickName;  
		password = jsonMsg.password;  
		status = jsonMsg.status;	        
                userId = jsonMsg.userId;
                console.log((new Date()) + ' USER ID : ' + userId + ', STATUS : '+status);	        
               var statusObj = {
                    userId: userId,
                    userName : userName,
		    user:user,
		    nickName:nickName,
	            status:status
                };
                userList[userId] = statusObj;
		var changedUsersJSON = JSON.stringify({
					type:'CONNECTED',
					userId:userId,
				        user:user, 
					userName:userName,
					nickName:nickName,
					password:password,
					userList: userList
					});
		//Send update logined user list to every user
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(changedUsersJSON);
                }
		console.log('======================   USER STATUS CHANGED ===================================');
            }else if(jsonMsg.type === 'CHAT'){ // log and broadcast the message
		console.log('======================   GONNA START CHAT ===================================');
                console.log((new Date()) + ' : SENDER IS : '+ jsonMsg.senderName + ', his sender id is : [' 
			+jsonMsg.senderId+ '], RECIPIENT IS: '+jsonMsg.recipientName+', his recipient id is : ['
			+jsonMsg.recipientId+ '], Message is : '+ jsonMsg.data);

                // we want to keep history of all sent messages
                var chatDetailJSON = {
                    time:(new Date()).getTime(),
                    text:jsonMsg.data,
                    senderId:jsonMsg.senderId, // 0 
		    senderName:jsonMsg.senderName, // senthil
		    recipientId:jsonMsg.recipientId, // 1
		    recipientName:jsonMsg.recipientName, //felix
                    color: userColor
                };
                history.push(chatDetailJSON);
                // broadcast message to all connected clients
                var messageJSON = JSON.stringify({type:'MESSAGE', data: chatDetailJSON});
                var recipientId = parseInt(jsonMsg.recipientId);
		console.log('recipient id : '+recipientId);
                clients[recipientId].sendUTF(messageJSON);                
		console.log('======================   GONNA END CHAT ===================================');
            }else {
		console.log('======================   GONNA START VIDEO CHAT ===================================');		
		var recipientId = parseInt(jsonMsg.recipientId);
		console.log('==='+recipientId);
		clients[0].sendUTF(message.utf8Data);
		console.log('successfully sent...');
		}
        }
    });


function sendCallback(err) {
    if (err) console.error("send() error: " + err);
}

    // user disconnected
 connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            userList.splice(userIndex, 1);
            // push back user's color to be reused by another user
          //  colors.push(userColor);
            userids.push(userId);
        }
    });

});
