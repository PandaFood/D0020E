# Varnande Lurar

This project was built for the course D0020E at Luleå Tekniska Universitet.

It contains a frontend website and a server. The website visualises data it gets via websocket from the server. 
The data is real-time sensor data from WideFind sensors.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

For compiling this project you need

- [Node.js](https://nodejs.org)
- npm (included in node.js installation)

### Installing

Open the folder for the part you want to compile in a terminal.

#### Server
First, install the dependencies using
```
npm install
```

Configure the specific settings in the `config.js` file.

Start it using

```
npm start
```

When it's up and running you get several different options to enter in the terminal

    u            Gets the latest data from the widefind database and transmits it.
    s            Starts listening for updates on the widefind database and transmits new data when it arrives.
    a            Gets all active sessions.
    r            Starts replaying data from the mongoDB.
    b            Spoofs some locationdata.
    h            Displays this help.



#### Website

Just open `index.html` in any modern browser.

Connect to the server by entering its IP-address.


## Built With

#### Server

* [Node.js](https://nodejs.org) - The JavaScript Compiler
* [npm](https://www.npmjs.com/) - Dependency Management
* [MongoDB](https://www.mongodb.com/) - The persistent storage
* [RethinkDB](https://www.rethinkdb.com/) - The sensor database
* [Express](https://www.npmjs.com/package/express) - The Web framework
* [WS](https://www.npmjs.com/package/ws) - The Websocket framework



#### Website

* [Three.js](https://threejs.org/) - Library for rendering WebGL in JavaScript

## Guides

[Git Guide](/docs/GITGUIDE.md), courtesy of @MTBorg


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


