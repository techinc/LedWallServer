var querystring = require('querystring');
var http = require("http");

function GameExecuter() {}


GameExecuter.prototype.init = function(screen, gameInfo, sockets, server, playerQueueManagement) {
    var self = this;

    this.screen = screen;

    this.gameInfo = gameInfo;
    
    this.sockets = sockets;
    this.server = server;
    

    this.playerQueueManagement = playerQueueManagement;

    this.sequentialRequestQueue = [] ;
   
    // there is a playerLimit that is not 0, it is a multiplayer game.
    //      have playerQueueManagement start the game
    //      every time the playerQueueManagement thinks it is necessary to introduce a new player the passed callback is called
    //          The passed callback, actually informs the game that the player should be introduced, and sets up streaming 
    //          controller input of the new player to the game.
    
    if (gameInfo.playerLimit) this.playerQueueManagement.startGame(gameInfo.playerLimit, function(id) {        
        self.introducePlayerRequest( id );
        
        var clients = self.sockets.clients() ;
        
        for( var i in clients )
            if( clients[ i ].id == id )                
                 self.streamControllerInput( clients[ i ], id ) ;
                
    });


    this.server.post('/killPlayer', function(req, res) { // if a call is made on the server to kill the player, kill it
        
        console.log( 'KILL PLAYER REQUEST RECEIVED' ) ;
        
        var responseData = "";

        req.on('data', function(chunk) {
            responseData += chunk;
        });

        req.on('end', function() { // when the playerId has been received, kill the player
            var playerId = querystring.parse( responseData ).playerId ; // req.body.playerId ; // JSON.parse(responseData);

            console.log( 'REQUEST COMPLETE, KILLING PLAYER WITH ID ' + playerId  ) ;
            
            var clients = self.sockets.clients() ;
            for( var i in clients )
                if( clients[ i ].id == playerId )      
                    self.stopStreamingControllerInput( clients[ i ] ) ;
                    
            self.playerQueueManagement.killPlayer( playerId ); // don't forget to remove it from playerQueueManagement as well

        } ) ;
        
        res.end() ;
    });

    this.initRequest();

    this.previousTime = (new Date()).getTime();

    this.sequentialRequestsQueue = [];

    this.isSendingSequentialRequest = false;

    return this;
} ;

GameExecuter.prototype.getSocketById = function(socketId) {
    console.log( 'GameExecuter.prototype.getSocketById( id ) with id = ' + socketId ) ;
    
    var clients = this.sockets.clients(),

        client = null;

    for (var i in clients)
        {        
         if (clients[i].id == socketId ) 
            return clients[i] ;
        } ;
    return client;
};

GameExecuter.prototype.introducePlayerRequest = function(playerId) {
    var self = this;

    console.log( 'introducePlayerRequest ' + playerId ) ;
    
    this.sendSequentialRequest( 'introduce', playerId ) ; // send a request to introduce the player

    var client = this.getSocketById(playerId); 
    client.on('disconnect', function() { // but when the player disconnects send a request to remove the player
        self.sendSequentialRequest('removePlayer', playerId);
    });
};

GameExecuter.prototype.stopStreamingControllerInput = function( client )
    {
     client.removeAllListeners( 'controllerUp' ) ;
     client.removeAllListeners( 'controllerDown' ) ;
     client.removeAllListeners( 'controllerLeft' ) ;
     client.removeAllListeners( 'controllerRight' ) ;

     client.removeAllListeners( 'controllerA' ) ;
     client.removeAllListeners( 'controllerB' ) ;
     client.removeAllListeners( 'controllerX' ) ;
     client.removeAllListeners( 'controllerY' ) ;

     client.removeAllListeners( 'controllerStart' ) ;
     
     // this line should probably be added
     // client.removeAllListeners( 'onDisconnect' ) ;
     
    } ;

GameExecuter.prototype.streamControllerInput = function(client, playerId) {
    var self = this ;

    // send on any button that has been pressed to /playercommand

    client.on('controllerUp', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'up',
            event: message
        });
    });
    client.on('controllerDown', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'down',
            event: message
        });
    });
    client.on('controllerLeft', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'left',
            event: message
        });
    });
    client.on('controllerRight', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'right',
            event: message
        });
    });

    client.on('controllerA', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'a',
            event: message
        });
    });
    client.on('controllerB', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'b',
            event: message
        });
    });
    client.on('controllerX', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'x',
            event: message
        });
    });
    client.on('controllerY', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'y',
            event: message
        });
    });

    client.on('controllerStart', function(message) {
        self.sendSequentialRequest('playerCommand', {
            playerId: playerId,
            button: 'start',
            event: message
        });
    });

};

GameExecuter.prototype.sendSequentialRequest = function(path, message) {

    // Messages are not sent immediately. Instead, the next message is only sent after the first message has been confirmed.
    // This means the messages arrive in the same order as they are sent. Especially with player commands it is important
    // to first receive the button down event, and then receive the button up event.

    // if a previous message was sent, but it has not been confirmed yet, new messages are queued. And it could theoretically take
    // some time before a message is confirmed.

    this.sequentialRequestQueue.push({
        path: path,
        message: message
    });

    if (this.isSendingSequentialRequest) return; // if messages are already being sent, don't start sending messages, but return

    this.sendNextSequentialRequest(); // otherwise start the process of sending messages
};

GameExecuter.prototype.sendNextSequentialRequest = function() {

    this.isSendingSequentialRequest = true; // first make sure that any next call knows messages are being sent

    var self = this;

    // if there is a next request, send it, otherwise notify every caller that no messages are being sent right now
    var nextRequest = this.sequentialRequestQueue.shift(); 

    if (!nextRequest) {
        this.isSendingSequentialRequest = false;

        return;
    }
    // if there is a message, send it, and pass a callback that sends the next message if confirmation is received
    this.sendRequest(nextRequest.path, nextRequest.message, function() {
        self.sendNextSequentialRequest();
    });

};





GameExecuter.prototype.initRequest = function() {

    // inform the game of the screen dimensions and the location of the server
    // and then after the response to the init request has been received
    // start sending timeCycle requests every time a frame is needed
    var self = this;

    this.sendRequest('init', {
        serverUrl: "",
        width: self.screen.width,
        height: self.screen.height,
        serverPort: self.server.locals.port,
        serverPath: self.server.locals.path
    }, function() {
        self.timeCycleInterval = setInterval(function() {
            var elapsedTime = (new Date()).getTime() - self.previousTime;

            self.timeCycleRequest(elapsedTime);

        }, self.gameInfo.frameDuration ? self.gameInfo.frameDuration : 50); // if no other frame duration is specified the frame duration is 1 / 20 of a second, i.e. 50 milliseconds

    });

};


GameExecuter.prototype.timeCycleRequest = function(elapsedTime) {
    var self = this;

    this.sendRequest('timeCycle', {
        elapsedTime: elapsedTime
    }, function(queryData) {

        var obj = JSON.parse(queryData);

        if (obj.type == "bitmap") self.screen.fromObject(obj.content);
        
        console.log( 'TIME_CYCLE COMPLETE' ) ; 
    });

};



GameExecuter.prototype.stopRequest = function(callback) {
    var self = this;
    clearInterval(this.timeCycleInterval);

    this.sendRequest('stop', '', function() {
        callback();
    });

};

GameExecuter.prototype.sendRequest = function(path, message, callback) {

    // sends a request
    // collects all the response data
    // and when all response data is in, calls callback with the response data

    // prepare the request, i.e. send it to the address specified in this.gameInfo
    var options = {
        host: this.gameInfo.host,
        port: this.gameInfo.port,
        path: this.gameInfo.path + '/' + path,
        method: 'POST'
    };

    // collect all response data as it comes in piece by piece
    var queryData = "";

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            queryData += chunk;
        });

        res.on('end', function() {
            callback(queryData) ; // and when all data has been received, call callback passing the data as its argument
        });


    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });


    req.write(JSON.stringify(message));
    req.end();

};


module.exports = GameExecuter;