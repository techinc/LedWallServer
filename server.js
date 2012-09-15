var path = require("path");
var express = require("express");
var mustache = require("mustache");
var fs = require("fs");
var consolidate = require("consolidate");
var socketio = require("socket.io");
var os = require("os");
var ArduinoScreen = require("./ArduinoScreen");
var fs = require("fs");
var url = require("url");
var GamePicker = require("./GamePicker");
var PlayerQueueManagement = require("./PlayerQueueManagement");

var RemoteScreen = require( './RemoteScreen' ) ;

var WIDTH = 12;
var HEIGHT = 10;

var server = express();

var htmlPort = 3000 ;
var socketIoPort = 3001;
var browserScreenPort = 4444 ;

var io = socketio.listen(socketIoPort);

io.set('log level', 0);


server.configure(function() {

    // server.use('/media', express.static(__dirname + '/media'));
    //  server.use(express.static(__dirname + '/public'));

    server.use(express.static(path.dirname() + '/public'));

    server.set('views', path.dirname() + '/views');

    server.engine('.html', consolidate.mustache);

});
    
function screenFromArguments( args )
    {

     for( var i = 2 ; i < args.length ; i++ )
        {   
         console.log( args[ i ] ) ;
         switch( args[ i ] )
            {
             case '--runAtHome' :
                return (new RemoteScreen()).init( server, browserScreenPort, WIDTH, HEIGHT ) ;         
            }
        }
     return (new ArduinoScreen()).init('/dev/leddisplay', WIDTH, HEIGHT) ;
    } ;

var screen = screenFromArguments( process.argv ) ;
// (new ArduinoScreen()).init('/dev/leddisplay', WIDTH, HEIGHT);
var gamePicker;

setTimeout(function() {

    var playerQueueManagement = (new PlayerQueueManagement()).init();


    io.sockets.on('connection', function() {
        self.playerQueueManagement.addConnectingPlayer(socket.id);
    });


    io.sockets.on('disconnect', function() {
        self.playerQueueManagement.removeDisconnectingPlayer(socket.id);
    });


    gamePicker = (new GamePicker()).init(screen, io.sockets, server, playerQueueManagement);


    server.get('/', function(req, res) {
        res.render('snesController.html', {
            socketIoPort: socketIoPort
        });
    });

    server.get('/list', function(req, res) {
        var getInfo = url.parse(req.url, true);
        console.log('LIST ' + JSON.stringify(getInfo));

        if (getInfo.query && getInfo.query.fileName) {
            console.log('ADDING FILE');

            try {
                var gameInfoString = fs.readFileSync('./games/' + getInfo.query.fileName);
            } catch (err) {
                gameInfoString = false
            }

            var gameInfo = getInfo.query;

            var fileName = getInfo.query.fileName;

            delete gameInfo.fileName;

            if (gameInfoString) gameInfo.image = JSON.parse(gameInfoString).image;

            console.log('./games/' + fileName);

            fs.writeFileSync('./games/' + fileName, JSON.stringify(gameInfo));

            gamePicker.loadGames();
        }


        var fileSet = fs.readdirSync('./games');

        console.log(fileSet);

        var fileSetForView = {
            fileSet: []
        }

        for (var i in fileSet)

        fileSetForView.fileSet.push({
            fileName: fileSet[i]
        });

        console.log(fileSetForView);

        res.render('list.html', fileSetForView);
    });


    server.get('/edit', function(req, res) {
        console.log('EDIT');

        var getInfo = url.parse(req.url, true);
        var gameInfoString = false;
        try {
            gameInfoString = fs.readFileSync('./games/' + getInfo.query.fileName);
        } catch (err) {};

        var view = {};
        if (gameInfoString) {
            console.log('gameInfoString ' + gameInfoString);
            view = JSON.parse(gameInfoString);
            view.fileName = getInfo.query.fileName; // "getInfo.filename" ;
        } else view = {
            fileName: getInfo.query.fileName,
            host: "",
            port: "",
            path: "",
            frameDuration: ""
        };

        res.render('edit.html', view);
    });


    io.sockets.on('connection', function(socket) {

        socket.emit('setMessage', '');

        console.log('socket connected');

        socket.on('controllerConnect', function(data) {
            console.log('controllerConnect ' + data);
        });

        socket.on('controllerA', function(data) {
            console.log('a' + data); /* socket.emit( 'setMessage', 'a' ) ; */
        });
        socket.on('controllerB', function(data) {
            console.log('b' + data); /* socket.emit( 'setMessage', 'b' ) ;  */
        });

        socket.on('controllerStart', function(data) {
            console.log('start' + data);
        });
        socket.on('controllerSelect', function(data) {
            console.log('select' + data);
        });

        socket.on('controllerUp', function(data) {
            console.log('up' + data);
        });
        socket.on('controllerDown', function(data) {
            console.log('down' + data);
        });
        socket.on('controllerLeft', function(data) {
            console.log('left' + data);
        });
        socket.on('controllerRight', function(data) {
            console.log('right' + data);
        });


    });

    server.listen(htmlPort);


}, 2000);
