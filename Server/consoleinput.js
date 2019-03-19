/**
 * @fileOverview Console commands for debug purpuse
 */

/**
 * @constructor
 */
module.exports = function (session, database) {
    console.log('Session set in consoleInput as ' + session)

    /**
     * @callback sensorObject
     */
    this.start = function (sensor) {
        console.log('Started catching input...')

        var stdin = process.openStdin()

        stdin.addListener('data', function (d) {
            // note:  d is an object, and when converted to a string it will
            // end with a linefeed.  so we (rather crudely) account for that
            // with toString() and then trim()
            console.log('you entered: [' +
                d.toString().trim() + ']')

            // Note: Using the bind method to get a correct 'this' call
            //      for more info, check out the documentation at
            //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
            if (d.toString().trim() === 'u') {
                sensor.GetUpdates(session.sendUpdate.bind(session))
            }
            if (d.toString().trim() === 's') {
                sensor.StartWorker(session.sendUpdate.bind(session))
                console.log('Started getting updates')
            }
            if (d.toString().trim() === 'a') {
                console.log(session.sessions)
            }
            if (d.toString().trim() == 'r') {
                database.Replay(session.sendUpdate.bind(session));
                console.log('Started replaying log')
            }
            if (d.toString().trim() == 'b') {
                database.Spoof();
            }
            if (d.toString().trim() == 'h') {
                console.log('Your options are')
                console.log('Command:     Decription:')
                console.log()
                console.log('u            Gets the latest data from the widefind database and transmits it.')
                console.log('s            Starts listening for updates on the widefind database and transmits new data when it arrives.')
                console.log('a            Gets all active sessions.')
                console.log('r            Starts replaying data from the mongoDB.')
                console.log('b            Spoofs some locationdata.')
                console.log('h            Displays this help.')
            }

        })
    }
}