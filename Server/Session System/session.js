/**
 * @fileOverview A single session
 */
var id = 0

function getNextID () {
  return id++
}

module.exports = class Session {
  constructor (connection) {
    this.connection = connection
    this._autheticated = false
    this.ID = getNextID()
  }

  get sessionConnection () {
    return this.connection
  }

  set autheticated (value) {
    this._autheticated = value
  }

  get autheticated () {
    return this._autheticated
  }
}
