/* CONFIG */
var config = {
    database = {
        tunnel={
            username:'root',
            password:'vandrandelurar',
            host:'130.240.207.20',
            port:51315,
            dstHost:'127.0.0.1',
            dstPort:27017,
            localHost:'127.0.0.1',
            localPort: 27017
          },
        
          numberunits: 5, //number of units logged
          delay: 100,    //in ms delay per new data insert
          spooflogged: 20,
        
          numberlogged: 20,
          timeout: 1, //In minutes
    },
    rethink={
        Host = '35.180.30.36',
        Port = 28016,
        User = 'admin',
        Pass = '***REMOVED***'
    }
};

