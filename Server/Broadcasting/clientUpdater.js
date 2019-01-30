/**
 * @fileOverview Part responsible for sending the clients updates
 */

var WebSocket = require('ws');

/**
 * @param  {} wss Websocket Server to use
 */
module.exports = function(wss){
  console.log("WS server set in clientUpdater as " + wss);

  this.sendBroadcastUpdate = function(data){
    console.log("Broadcasting row... ");

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });

  }
}