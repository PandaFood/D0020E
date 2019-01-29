var WebSocketServer = require("websocket").server;
var http = require("http");

/*
      Create Server
*/
var httpServer = http.createServer(function(request, response) {
  console.log((new Date()) + " - Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

/*
      Waiting for connection
*/
httpServer.listen(8080, function() {
  console.log((new Date()) + " - Server is listening on port 8080");
});

var connections = [];

/*
      Create Websocket
*/
var server = new WebSocketServer({
  httpServer:httpServer
});

/*
      Websocket connection handler
*/
server.on("request", function(request) {
  var connection = request.accept("", request.origin);
  connections.push(connection);
  console.log((new Date()) + " - " + request.remoteAddress + " connected!");
  connection.on("message", function(message) {
    if(message.type === "utf8") {
      //message.utf8Data
    }
  });
  connection.on("close", function(reasonCode, description) {
    for(var i = 0; i < connections.length; ++i) {
      if(connections[i] == this) {
        connections.splice(i, 1);
        break;
      }
    }
    console.log((new Date()) + " - " + this.remoteAddress + " disconnected!");
  });
});

/*
      Get data from rethinkdb/widefinder database
*/
var rethink = require("rethinkdb");

var database = null;
rethink.connect({host:"35.180.30.36", port:28016, user: "admin", password:"UnlikelySnuggleBuild"}, function(error, connection) {
  if(error) {
    throw error;
  }
  database = connection;

  rethink.db("wf100").table("current_state").changes().run(database, function(error, result) {
    if(error) {
      throw error;
    }
    result.each(function(error, row) {
      if(error) {
        throw error;
      }
      console.log(row);

/*
      Standardized JSON format
*/
      var json = {
        version:1,
        action:0,
        entities:[]
      };

      json.entities.push({
        id:row.new_val.id,
        type:"human",
        data:{
          position:{
            x: row.new_val.pos[0],
            y: row.new_val.pos[2],
            z: row.new_val.pos[1]
          },
          velocity:{
            x: row.new_val.vel[0],
            y: row.new_val.vel[2],
            z: row.new_val.vel[1]
          },
          battery: row.new_val.bat,
          signal: row.new_val.rssi
        }
      });

      console.log(json, json.entities[0]);      //Check format
      
      /*for(var i = 0; i < 100; ++i) {
        json.entities.push({
          id:i,
          type:"human",
          data:{
            position:{
              x:Math.random() * 40 - 20,
              y:1.8,
              z:Math.random() * 40 - 20
            }
          }
        });
      }*/

      for(var i = 0; i < connections.length; ++i) {
        var connection = connections[i];
        connection.sendUTF(JSON.stringify(json));
      }
    });
  });
});


/*
wss.clients.forEach(function each(client) {
  if (client !== ws && client.readyState === WebSocket.OPEN) {
    client.send(data);
  }
});

*/