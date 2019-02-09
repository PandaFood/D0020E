const Session = require('./session')
const Websocket = require('./websocket')

module.exports = class WSSession {
  constructor (webSocketServer) {
    this.wss = webSocketServer
    console.log('Websocket server attatched: ' + this.wss)
    this.sessions = []
    this.webSocket = new Websocket(this.wss, this)
    console.log('Websocket handler attatched: ' + this.webSocket)
  }

  add (ws) {
    this.sessions.push(new Session(ws))
    console.log('Added new session')
  }

  disconnect (id) {
    var index = this.sessions.findIndex(i => i.ID === id)

    return this.sessions.splice(index, 1)
  }

  getSessionByID (id) {
    for (var i in this.sessions) {
      if (this.sessions[i].ID === id) { return i }
    }

    return null
  }

  getSessionByConnection (connection) {
    for (var i in this.sessions) {
      if (this.sessions[i].connection === connection) { return i }
    }

    return null
  }

  get getSessions () {
    return this.sessions
  }

  sendUpdate (data) {
    this.webSocket.sendUpdate(data)
  }
}
