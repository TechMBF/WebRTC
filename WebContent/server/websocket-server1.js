var WebSocketServer = require('websocket').server;
var http = require('http');
var clients = [];

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1336, function() {
  console.log((new Date()) + " Server is listening on port 1336");
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

function sendCallback(err) {
    if (err) console.error("send() error: " + err);
}

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    console.log(' Connection ' + connection.remoteAddress);
    clients.push(connection);
    
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        
        if (message.type === 'utf8') {
            // process WebSocket message
            console.log((new Date()) + ' Received Message======== ' +message.utf8Data);
            // broadcast message to all connected clients
	   
//var connection1.remoteAddress = "192.168.2.100";
	     console.log('output connection : '+connection.remoteAddress);

            clients.forEach(function (outputConnection) {
      	     console.log('output connection : '+outputConnection.remoteAddress);
//		if(outputConnection == "192.168.2.130")	     
//{
//			outputConnection.send(message.utf8Data, sendCallback);
//}
//                if (outputConnection != connection) {
                  console.log(connection+'<---------connection------>'+connection);
                  outputConnection.send(message.utf8Data, sendCallback);
console.log('successfully sent');
//		  connection1.send(message.utf8Data, sendCallback);
  //              } 
            });
        }
    });
    
    connection.on('close', function(connection) {
        // close user connection
        console.log((new Date()) + " Peer disconnected.");        
    });
});
