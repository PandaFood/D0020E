var tunnel = require('tunnel-ssh');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";

/*
        Set config to db log
*/

var dbconfig = {
    numberlogged: 20
}

/*
        Set spoof data config
*/

var spoofconfig = {
    numberunits: 5,
    delay: 100,    //in ms delay per new data insert
    numberlogged: 20
}

/*
        Set config for tunnel to ssh server
*/

var config = {
  username:'root',
  password:'vandrandelurar',
  host:'130.240.207.20',
  port:51315,
  dstHost:'127.0.0.1',
  dstPort:27017,
  localHost:'127.0.0.1',
  localPort: 27017,
};

/*
      Create tunnel to ssh client and connect to local instance of mongodb on ssh computer.
*/
var server = tunnel(config, function(error, server) {
    if(error){
        console.log("SSH connection error: " + error);
    }
    console.log("SSH connection established");
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Database created");
  
        // Select database
        global.dbo = db.db("VandrandeLurar");
  
        dbo.createCollection("customers",function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
        });
        spoofData(dbo);
        //db.close();
        //console.log("Database closed");
    });
});

/*
        Inserts data into mongodb server database and removes duplicates in database so it's just one "instance"
        PARAM:  'indata' input data
                'dbo' database instance
*/

function insertToDatabase(indata,dbo) {
    var query = {id: indata.id}
    dbo.collection("json").find(query).toArray(function(err,result) {
      if (err) throw err;
      if (result[0] != null) {
        console.log(result[0]);
        var myquery = { id: result[0].id };
        dbo.collection("json").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            var myobj = indata;
            dbo.collection("json").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
        });
      } else {
        var myobj = indata;
        dbo.collection("json").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        });
      };
    });
};

/*
        Inserts data into mongodb server database, into log collection, set number logged in config
        PARAM:  'indata' input data
                'dbo' database instance
*/

function logInsert(indata,dbo) {
    var datetime = new Date().toLocaleString();
    var logjson = {
        id: indata.id,
        date: datetime,
        entities:[]
    };
    logjson.entities.push(indata);
    var query = {id: indata.id};
    var result = dbo.collection("log").count(query, function(err,result){
        if (err) throw err;
        console.log(result);
        if (result < dbconfig.numberlogged) {
            var myobj = logjson;
            dbo.collection("log").insertOne(myobj, function(err, res) {
            if (err) throw err;
                console.log("1 document inserted");
            });
        } else {
            var myquery = {id: indata.id}
            dbo.collection("log").deleteOne(myquery, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
                var myobj = logjson;
                dbo.collection("log").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                });
            });
        };
    });
}

/*
        Spoofs data and inserts it into database
        PARAM:  'dbo' database instance
*/

function spoofData(dbo) {
    global.lock = 0;
    if (lock == 0) {  
      lock = 1;
      var json = {
        version:1,
        action:0,
        entities:[]
      };
  
      json.entities.push({
        id:Math.floor(Math.random() * spoofconfig.numberunits), 
        type:"human",
        data:{
          position:{
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
          },
          velocity:{
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
          },
          battery: Math.random(),
          signal: Math.random()
        }
      });
      console.log(json.entities[0]);
      lockvar = setTimeout(function(){ spoofLogInsert(json.entities[0],dbo); },spoofconfig.delay);
      //lockvar = setTimeout(function(){ insertSpoofData(json.entities[0],dbo); },spoofconfig.delay);
    }
}

/*
        Helper function to spoofData
*/
  
function insertSpoofData(indata,dbo) {
    var query = {id: indata.id}
    dbo.collection("json").find(query).toArray(function(err,result) {
      if (err) throw err;
      if (result[0] != null) {
        console.log(result[0]);
        var myquery = { id: result[0].id };
        dbo.collection("json").deleteOne(myquery, function(err, obj) {
          if (err) throw err;
          console.log("1 document deleted");
          var myobj = indata;
          dbo.collection("json").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
          });
        });
      } else {
        var myobj = indata;
        dbo.collection("json").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
      };
    });
    lock = 0;
    spoofData(dbo);
};

function spoofLogInsert(indata,dbo) {
    var datetime = new Date().toLocaleString();
    var logjson = {
        id: indata.id,
        date: datetime,
        entities:[]
    };
    logjson.entities.push(indata);
    var query = {id: indata.id};
    var result = dbo.collection("log").count(query, function(err,result){
        if (err) throw err;
        console.log(result);
        if (result < spoofconfig.numberlogged) {
            var myobj = logjson;
            dbo.collection("log").insertOne(myobj, function(err, res) {
            if (err) throw err;
                console.log("1 document inserted");
            });
        } else {
            var myquery = {id: indata.id}
            dbo.collection("log").deleteOne(myquery, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
                var myobj = logjson;
                dbo.collection("log").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                });
            });
        };
    });
    lock = 0;
    spoofData(dbo);
}