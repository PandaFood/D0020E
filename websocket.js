/**
 * @fileOverview Websocket Handler
 */

const WEBSOCKET = require('ws')
const SERVERIP = '127.0.0.1'

module.exports = class WebsocketHandler {
  constructor (wss, session) {
    this.wss = wss
    this.session = session
    init(wss, session)
  }

  sendUpdate (data) {
    //console.log('Broadcasting row... ')
    //console.log(data)
    this.wss.clients.forEach(function each (client) {
      if (client.readyState === WEBSOCKET.OPEN) {
        client.send(data)
      }
    })
  }
}

function init (wss, session) {
  wss.on('connection', function connection (ws, req) {
    const connectedIP = req.connection.remoteAddress
    session.add(ws)
    console.log('New client connected at ' + connectedIP)

    // TODO: AUTHENTICATION

    ws.on('message', function (msg) {
      // Command.parse(msg)

      // Log the received message and send it back to the client
      console.log(connectedIP + ' sent: ' + msg)
      // ws.send('Echo: ' + msg)
    })

    // TODO: FIX INITIAL CONFIG SENDING
    ws.send(JSON.stringify(INITALCONFIG))
    ws.send(JSON.stringify(INITALAUTH))
    ws.send(JSON.stringify(INITIALTYPES))
    ws.send(JSON.stringify(INITBACKGROUND))
  })
}

const INITALCONFIG = {
  'version': 1,
  'action': 1,
  'salt': '1'
}

const INITALAUTH = {
  'version': 1,
  'action': 3,
  'success': true
}

const INITIALTYPES = {
  'version': 1,
  'action': 4,
  'types': [
    {
      'type': 'human',
      'iconURI': `http://${SERVERIP}:3000/images/test/human.png`,
      'displayName': 'Human'
    }
  ]
}

const INITBACKGROUND = {
  'version': 1,
  'action': 5,
  'images': [
    {
      'imageURI': `http://${SERVERIP}:3000/images/map.png`,
      'position': { 'x': 0, 'y': 0, 'z': 0 },
      'rotation': 45,
      'scale': 180
    }
  ]
}
