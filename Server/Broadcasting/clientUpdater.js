
/*
      Get data from rethinkdb/widefinder database
*/
var rethink = require("rethinkdb");

var connections = [];

console.log("Started db connection...");

rethink.connect({host:"35.180.30.36", port:28016, user: "admin", password:"UnlikelySnuggleBuild"}, function(error, database){
  if(error) {
    throw error;
  }

  console.log("Database connected. ");

  rethink.db("wf100").table("current_state").run(database, function(error, result) {

    if(error) {
        throw error;
      }
      result.each(function(error, row) {
        if(error) {
          throw error;
        }
        //console.log(row);
  
        jsonify(row);
    });
  });


  rethink.db("wf100").table("current_state").changes().run(database, function(error, result) {
    if(error) {
      throw error;
    }
    result.each(function(error, row) {
      if(error) {
        throw error;
      }
      //console.log(row);

      jsonify(row);


      /*
      for(var i = 0; i < connections.length; ++i) {
        var connection = connections[i];
        connection.sendUTF(JSON.stringify(json));
      } */
      
    });
  });
});


    /*
        Standardized JSON format
    */
function jsonify(data){

    console.log(data);

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

    console.log(json, json.entities[0]);      //Check format

}


/*

wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });

  */