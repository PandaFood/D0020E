var rethink = require("rethinkdb");


module.exports = function (websocketServer, clientUpdater) {
    console.log("WS server set in consoleInput as " + websocketServer);
    console.log("clientUpdater set in consoleInput as " + websocketServer);

    this.start = function () {
        console.log("Started catching input...");

        var stdin = process.openStdin();

        stdin.addListener("data", function (d) {
            // note:  d is an object, and when converted to a string it will
            // end with a linefeed.  so we (rather crudely) account for that  
            // with toString() and then trim() 
            console.log("you entered: [" +
                d.toString().trim() + "]");

            if (d.toString().trim() == "u") {

                rethink.connect({
                    host: "35.180.30.36",
                    port: 28016,
                    user: "admin",
                    password: "***REMOVED***"
                }, function (error, database) {
                    if (error) {
                        throw error;
                    }

                    console.log("Getting most recent positions... ");


                    rethink.db("wf100").table("current_state").run(database, function (error, result) {
                        if (error) {
                            throw error;
                        }
                        result.each(function (error, row) {
                            if (error) {
                                throw error;
                            }

                            clientUpdater.sendBroadcastUpdate(row);
                        });
                    })
                });
            }
        });


    }
}