/**
 * @fileOverview Console commands for debug purpuse
 */

/** 
 * @constructor 
 */
module.exports = function (websocketServer, clientUpdater) {
    console.log("WS server set in consoleInput as " + websocketServer);
    console.log("clientUpdater set in consoleInput as " + websocketServer);


    
    /**
     * @callback sensorObject
     */
    this.start = function (sensorObject) {
        console.log("Started catching input...");

        var stdin = process.openStdin();

        stdin.addListener("data", function (d) {
            // note:  d is an object, and when converted to a string it will
            // end with a linefeed.  so we (rather crudely) account for that  
            // with toString() and then trim() 
            console.log("you entered: [" +
                d.toString().trim() + "]");

            if (d.toString().trim() == "u") {
                sensorObject.GetLatestUpdates(clientUpdater);
                
            }
        });


    }
}