var rethink = require("rethinkdb");
var WebSocket = require('ws');

/*
    Standardized JSON format
*/
function jsonify(data){

    var json = {
        version:1,
        action:0,
        entities:[]
    };

    json.entities.push({
        id:data.id,
        type:"human",
        data:{
        position:{
            x: data.pos[0],
            y: data.pos[2],
            z: data.pos[1]
        },
        velocity:{
            x: data.vel[0],
            y: data.vel[2],
            z: data.vel[1]
        },
        battery: data.bat,
        signal: data.rssi
        }
    });

    return JSON.stringify(json);
}


module.exports = function(wss){
  console.log("WS server set in clientUpdater as " + wss);

  this.sendBroadcastUpdate = function(data){
    console.log("Broadcasting row... ");

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(jsonify(data));
        }
      });

  }
}