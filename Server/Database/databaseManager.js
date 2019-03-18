var tunnel = require('tunnel-ssh');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
var rawconfig = require('../config');
var config = rawconfig.database;
var replaystop = 0;
var dbo;


//module.exports = class databaseManager {
//  constructor() {
//    createTunnel();
  //clearInactive();
//  }



//}

module.exports = function() {
  this.Start = function() {
    createTunnel();
  }

  this.Replay = function(callback) {
    replaystop = 1;
    replayget(function(loop){
      console.log(loop + " number of things in log");
      replayloop(loop,callback);
    });
  }

  this.Log = function(data) {
    if (replaystop > 0) {
      clearInactive();
    } else {
      clearInactive();
      logInsert(data);
      insertToDatabase(data);
    }
  }

  this.Spoof = function() {
    spoofData();
  }
}

function createTunnel() {
  var server = tunnel(rawconfig.tunnel, function(error, server) {
    if(error){
      console.log("SSH connection error: " + error);
    }
    console.log("SSH connection established");
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      console.log("Database created");
  
      // Select database
      dbo = db.db("VandrandeLurar");
    });
  });
}



/*
        Inserts data into mongodb server database and removes duplicates in database so it's just one "instance"
        @param: indata input data
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
        @param indata input data
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
    if (result < config.numberlogged) {
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
        @param 'id' id for searched unit
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
        @param id matcing id for searched unit
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
  var newtime = datetime.getTime() - (config.timeout*1000*60);
  var query = {date: {$lt: newtime}};
  //console.log(newtime);
  dbo.collection("json").deleteMany(query, function(err,res) {
    if (err) throw err;;
    console.log("Inactive documents deleted");
  });
}

/*
        Spoofs data and inserts it into database
        @param dbo database instance
*/

function spoofData() {
    global.lock = 0;
    if (lock == 0) {  
      lock = 1;
      var json = {
        version:1,
        action:0,
        entities:[]
      };
  
      json.entities.push({
        id:String(Math.floor(Math.random() * config.numberunits)), 
        type:"human",
        position:{
            x: 100*Math.random(),
            y: 100*Math.random(),
            z: 100*Math.random()
        },
        velocity:{
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
        },
        battery: Math.random(),
        signal: Math.random()
      });
      console.log(json.entities[0]);
      lockvar = setTimeout(function(){ spoofLogInsert(json.entities[0]); },config.delay);
      //lockvar = setTimeout(function(){ insertSpoofData(json.entities[0]); },spoofconfig.delay);
    }
}

/*
        Helper function to spoofData
*/
  
function insertSpoofData(indata) {
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

function spoofLogInsert(indata) {
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
        if (result < config.numberlogged) {
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

/*
*   Copies whole log to templog and fetches number in log
*   @callback number in log
*/
function replayget(callback) {
  console.log("replayget")
  dbo.collection("templog").drop(function(err,res){
    if (err) throw err;
    dbo.collection("log").find().forEach( function(x){
      dbo.collection("templog").insertOne(x)
    }).then(function(){
      dbo.collection("templog").find().count(function(err,res){
        if (err) throw err;
        return callback(res);
      });
    });
  });
}


/*
*   Loop to replay log, loop dictates how long to loop. Does callback with current item from log.
    @param 'loop' number of loops to complete
*   @callback item from log
*/
function replayloop(loop,callback) {
  var data;
  //console.log("loop "+loop)
  dbo.collection("templog").findOne({},function(err,res){
    if (err) throw err;
    //console.log(res);
    data = res.entities;
    dbo.collection("templog").deleteOne({},function(err,res){
      if (err) throw err;
    });
    //console.log(data);
    var json = {
      version: 1,
      action: 0,
      entities: data
    }

    console.log(json);
    callback(json);
  });
  if (loop > 1) {
    setTimeout(function(){ replayloop(loop-1,callback); },config.delay);
  } else {
    replaystop = 0;
    console.log('Replaying is done')
  }
}
