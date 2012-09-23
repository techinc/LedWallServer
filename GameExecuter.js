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
   
    if (gameInfo.playerLimit) this.playerQueueManagement.startGame(gameInfo.playerLimit, function(id) {        
        self.introducePlayerRequest( id );
        
        var clients = self.sockets.clients() ;
        
        for( var i in clients )
            if( clients[ i ].id == id )                
                 self.streamControllerInput( clients[ i ], id ) ;
                
    });


    this.server.post('/killPlayer', function(req, res) {
        
        console.log( 'KILL PLAYER REQUEST RECEIVED' ) ;
        
        
        var responseData = "";

        req.on('data', function(chunk) {
            responseData += chunk;
        });

        req.on('end', function() {
            var playerId = querystring.parse( responseData ).playerId ; // req.body.playerId ; // JSON.parse(responseData);

            console.log( 'REQUEST COMPLETE, KILLING PLAYER WITH ID ' + playerId  ) ;
            
            var clients = self.sockets.clients() ;
            for( var i in clients )
                if( clients[ i ].id == playerId )      
                    self.stopStreamingControllerInput( clients[ i ] ) ;
                    
            self.playerQueueManagement.killPlayer( playerId );

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
         console.log( ' i = ' + i + ' clients[ i ] = ' + clients[ i ] + 'clients[ i ].id = ' + clients[ i ].id + ' id = ' + socketId ) ;
        
         if (clients[i].id == socketId ) 
            return clients[i] ;
        } ;
    return client;
};

GameExecuter.prototype.introducePlayerRequest = function(playerId) {
    var self = this;

    console.log( 'introducePlayerRequest ' + playerId ) ;
    

    this.sendSequentialRequest( 'introduce', playerId ) ;

    var client = this.getSocketById(playerId);
    client.on('disconnect', function() {
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
     
    } ;

GameExecuter.prototype.streamControllerInput = function(client, playerId) {
    var self = this ;

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
    this.sequentialRequestQueue.push({
        path: path,
        message: message
    });

    if (this.isSendingSequentialRequest) return;

    this.sendNextSequentialRequest();
};

GameExecuter.prototype.sendNextSequentialRequest = function() {

    this.isSendingSequentialRequest = true;

    var self = this;

    var nextRequest = this.sequentialRequestQueue.shift();

    if (!nextRequest) {
        this.isSendingSequentialRequest = false;

        return;
    }

    this.sendRequest(nextRequest.path, nextRequest.message, function() {
        self.sendNextSequentialRequest();
    });

};





GameExecuter.prototype.initRequest = function() {

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

        }, self.gameInfo.frameDuration ? self.gameInfo.frameDuration : 50);

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
    var options = {
        host: this.gameInfo.host,
        port: this.gameInfo.port,
        path: this.gameInfo.path + '/' + path,
        method: 'POST'
    };

    var queryData = "";

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            queryData += chunk;
        });

        res.on('end', function() {
            callback(queryData)
        });


    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });


    req.write(JSON.stringify(message));
    req.end();

};


module.exports = GameExecuter;