/* CONFIG */



var database = {
    numberunits: 5, //number of units logged
    delay: 1000,    //in ms delay per new data insert
    spooflogged: 20,

    numberlogged: 20,
    timeout: 1, //In minutes
};
var rethink1 = {
    Host:'ip',
    Port:28016,
    User:'admin',
    Pass:'password'
};
var tunnel = {
    username:'root',
    password:'vandrandelurar',
    host:'ip',
    port:51315,
    dstHost:'127.0.0.1',
    dstPort:27017,
    localHost:'127.0.0.1',
    localPort: 27017
};

module.exports.rethink1 = rethink1;
module.exports.tunnel = tunnel;
module.exports.database = database;

