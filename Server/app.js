var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var debug = require('debug')('server:server')
var http = require('http')
var WebSocket = require('ws')
var ConsoleInput = require('./consoleinput')
var indexRouter = require('./routes/index')
var SessionManager = require('./Session System/sessionSystem')
var SensorManager = require('./Sensor System/sensorManager')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Initialize a simple http server
const server = http.createServer(app)

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server })

// Start the server on port 3000
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${server.address().port}`)
})

var session = new SessionManager(wss)

var sensors = new SensorManager()

var cli = new ConsoleInput(session)
cli.start(sensors.wideFind, session)

// Apply routes for HTML
app.use('/', indexRouter)
