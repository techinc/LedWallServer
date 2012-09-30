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

var htmlPort = 3000 ; var htmlPath = "" ;
var socketIoPort = 3001;
var browserScreenPort = 4444 ;

var io = socketio.listen(socketIoPort);

io.configure( function() 
    {
     io.set('log', false); // don't log, cause you won't be able to see any other debug message
    } ) ;


server.configure(function() {

    server.use(express.static(path.dirname() + '/public')); // serve all files in the folder /public

    server.set('views', path.dirname() + '/views'); // the folder views contains all the html templates

    server.engine('.html', consolidate.mustache); // use mustache as the template engine

});
    
function screenFromArguments( args )
    {
     // if one of the command line arguments is "--runAtHome", use a browser screen, otherwise, use the arduino connected to the led wall
     for( var i = 2 ; i < args.length ; i++ )
        {   
         console.log( args[ i ] ) ;
         switch( args[ i ] )
            {
             case '--runAtHome' :
                return (new RemoteScreen()).init( server, browserScreenPort, WIDTH, HEIGHT ) ;         
            }
        }
     // if no argument is --runAtHome, make the arduino the screen
     return (new ArduinoScreen()).init('/dev/leddisplay', WIDTH, HEIGHT) ;
    } ;

// create a screen, based on command line arguments
var screen = screenFromArguments( process.argv ) ;
// (new ArduinoScreen()).init('/dev/leddisplay', WIDTH, HEIGHT);
var gamePicker;

setTimeout(function() {

    // SET UP PLAYER MANAGEMENT
    
    var playerQueueManagement = (new PlayerQueueManagement()).init();

    // if a player connects add him to playerQueueManagement, if a player disconnects remove the player from playerQueueManagement
    
    io.sockets.on('connection', function( socket ) {
        playerQueueManagement.addConnectingPlayer(socket.id);
        
        socket.on('disconnect', function() {
            playerQueueManagement.removeDisconnectingPlayer(socket.id);
        });
    });


    

    // CREATE A GAME PICKER
    gamePicker = (new GamePicker()).init(screen, io.sockets, server, playerQueueManagement);

    // LOAD THE CONTROLLER
    server.get('/', function(req, res) {
        res.render('snesController.html', { // render the snesController template, with the correct port, so that the controller can make a socket connection to the server
            socketIoPort: socketIoPort
        });
    });


    // THE WEB PAGES FOR ADDING YOUR GAME TO THE SCREEN

    server.get('/list', function(req, res) {
    
        error = '' ;
    
        var getInfo = url.parse(req.url, true);
        console.log('LIST ' + JSON.stringify(getInfo));


        if (getInfo.query && getInfo.query.fileName ) {
            console.log('ADDING FILE');

            if( !getInfo.query.filename.match( '^[a-zA-Z]$' ) ) {
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
            else
                error = 'server/list: illegal filename' ;
        }

        // load the .json files in ./games
        var fileSet = fs.readdirSync('./games');

        console.log(fileSet);
        
        
        // format the found data to pass as vars to html template
        var fileSetForView = {
            error: error,
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
        var error = '' ;

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
            error: error,
            fileName: getInfo.query.fileName,
            host: "",
            port: "",
            path: "",
            frameDuration: ""
        };

        res.render('edit.html', view);
    });

    // write pressed buttons to command line for debugging

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

    server.locals.port = htmlPort ;
    server.locals.path = htmlPath ;
    server.listen(htmlPort);
    

}, 2000);
