var tunnel = require('tunnel-ssh');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";

/*
        Set config to db log
*/

var dbconfig = {
    numberlogged: 20,
    timeout: 1 //In minutes
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
        clearInactive();
        //spoofData(dbo);
        //db.close();
        //console.log("Database closed");
    });
});

/*
        Inserts data into mongodb server database and removes duplicates in database so it's just one "instance"
        PARAM:  'indata' input data
*/

function insertToDatabase(indata) {
  var datetime = new Date().getTime();
  var logjson = {
    id: indata.id,
    date: datetime,
    entities:[]
  };
  logjson.entities.push(indata);
    var query = {id: indata.id}
    dbo.collection("json").find(query).toArray(function(err,result) {
      if (err) throw err;
      if (result[0] != null) {
        console.log(result[0]);
        var myquery = { id: result[0].id };
        dbo.collection("json").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            var myobj = logjson;
            dbo.collection("json").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
        });
      } else {
        var myobj = logjson;
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
*/

function logInsert(indata) {
  var datetime = new Date().getTime();
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
        Gets data fron active instances that matches 'id'
        PARAM:  'id' id for searched unit
*/

function getById(id){
  var query = {id: indata};
  dbo.collection("json").find(query, function(err, res) {
    if (err) throw err;
    if (res != null) {
      return res;
    }
    throw "Id has no match in database.";
  });
}

/*
        Gets data fron log that matches 'id'
        PARAM:  'id' id for searched unit
*/

function getHistoryById(id) {
  var query = {id: indata};
  dbo.collection("log").find(query, function(err, res) {
    if (err) throw err;
    if (res != null) {
      return res;
    }
    throw "Id has no match in database.";
  });
}

/*
        Gets all active units
*/

function getActiveUnits() {
  dbo.collection("json").find(function(err, res) {
    if (err) throw err;
    if (res != null) {
      return res;
    }
    throw "There are no active instances in database.";
  });  
}

/*
        Clear active units that fail to meet timeout requirement in config.
*/

function clearInactive() {
  var datetime = new Date();
  var newtime = datetime.getTime() - (dbconfig.timeout*1000*60);
  var query = {date: {$lt: newtime}};
  //console.log(newtime);
  dbo.collection("json").deleteMany(query, function(err,res) {
    if (err) throw err;;
    console.log("Inactive documents deleted");
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