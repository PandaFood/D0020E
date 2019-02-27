/**
 * @fileOverview Handling the WideFind sensor
 */
var parser = require('./widefindparser')
var rethink = require('rethinkdb')
var config = require('../../config')

/*  DB CONFIG  */
const Host = config.rethink.Host;
const Port = config.rethink.Port;
const User = config.rethink.User;
const Pass = config.rethink.Pass;
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

          console.log(row)
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

          callback(parser.jsonify(row.new_val))
        })
      })
    })
  }
}