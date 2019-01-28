var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('server:server');
var http = require('http');
var WebSocket = require('ws');

var app = express();

var indexRouter = require('./routes/index');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });


wss.on('connection', function(ws){

    //connection is up, let's add a simple simple event
    ws.on('message', function(msg) {

        //log the received message and send it back to the client
        console.log('received:' + msg);
        ws.send('Hello, you sent: ' + msg);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


app.use('/', indexRouter);

