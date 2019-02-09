var parser = require('./widefindparser')
var rethink = require('rethinkdb')

/*  DB CONFIG  */
const Host = '35.180.30.36'
const Port = 28016
const User = 'admin'
const Pass = 'UnlikelySnuggleBuild'
/* ----------- */

/**
 * @constructor
 */
module.exports = function () {
  /**
     * Function to get all posts from DB. Mostly used for debug when sensors are down.
     *
     * @callback callback Function that is called back.
     * @returns {string} Returns data in standardized json string.
    */
  this.GetUpdates = function (callback) {
    rethink.connect({ host: Host, port: Port, user: User, password: Pass }, function (error, database) {
      if (error) throw error
      rethink.db('wf100').table('current_state').run(database, function (error, result) {
        if (error) { throw error }

        result.each(function (error, row) {
          if (error) { throw error }

          var jsonData = parser.jsonify(row)

          callback(jsonData)
        })
      })
    })
  }

  /**
     * Function to start fetching Widefind data from database.
     *
     * @callback callback Function that is called back.
     * @returns {string} Returns data in standardized json string.
    */
  this.StartWorker = function (callback) {
    rethink.connect({ host: Host, port: Port, user: User, password: Pass }, function (error, database) {
      if (error) { throw error }

      rethink.db('wf100').table('current_state').changes().run(database, function (error, result) {
        if (error) { throw error }

        result.each(function (error, row) {
          if (error) { throw error }

          return parser.jsonify(row)
        })
      })
    })
  }
}
