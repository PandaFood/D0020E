const WebSocket = require('ws');
const Command = require('./command')


module.exports = function(wss){

    wss.on('connection', function connection(ws, req){
        const connectedIP = req.connection.remoteAddress;
        console.log("New client connected at " + connectedIP);

        // TODO: AUTHENTICATION

        ws.on('message', function(msg) {

            Command.parse(msg);
    
            //Log the received message and send it back to the client
            console.log(connectedIP + ' sent: ' + msg);
            ws.send('Echo: ' + msg);
        });
    
        //Send immediatly a feedback to the incoming connection    
        ws.send('Connected');
    });

}
