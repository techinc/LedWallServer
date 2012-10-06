var querystring = require('querystring');
var http = require("http");

function HttpProtocol() {}

HttpProtocol.prototype.init = function( gameInfo, server, onKillPlayer, onFrame ) {

	this.gameInfo = gameInfo ;
	this.server = server ;
	this.onKillPlayer = onKillPlayer ;
	this.onFrame 	  = onFrame ;

	this.sequentialRequestQueue = [] ;

    var self = this ;

    this.server.post('/killPlayer', function(req, res) { // if a call is made on the server to kill the player, kill it

        console.log( 'KILL PLAYER REQUEST RECEIVED' ) ;
        
        var responseData = "";

        req.on('data', function(chunk) {
            responseData += chunk;
        });

        req.on('end', function() { // when the playerId has been received, kill the player
            var playerId = querystring.parse( responseData ).playerId ; // req.body.playerId ; // JSON.parse(responseData);

            console.log( 'REQUEST COMPLETE, KILLING PLAYER WITH ID ' + playerId  ) ;
              
            // playerId need not be checked on correctness because it can be any string.
            self.onKillPlayer( playerId ) ;
        } ) ;
        
        res.end() ;
    });

    // this.initRequest();
    this.isSendingSequentialRequest = false;
	
	this.previousTime = (new Date()).getTime();
    
	return this ;
} ;


HttpProtocol.prototype.introducePlayerRequest = function(playerId) {
    var self = this;

    console.log( 'introducePlayerRequest ' + playerId ) ;
    
    this.sendSequentialRequest( 'introduce', playerId ) ; // send a request to introduce the player

    
};


HttpProtocol.prototype.removePlayerRequest = function( playerId ) {
	this.sendSequentialRequest('removePlayer', playerId);
    
} ;

HttpProtocol.prototype.playerCommand = function( command ) {

	this.sendSequentialRequest('playerCommand', command );
	
} ;


HttpProtocol.prototype.sendSequentialRequest = function(path, message) {

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


HttpProtocol.prototype.sendNextSequentialRequest = function() {

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


HttpProtocol.prototype.initRequest = function( width, height ) {

    // inform the game of the screen dimensions and the location of the server
    // and then after the response to the init request has been received
    // start sending timeCycle requests every time a frame is needed
    var self = this;

    this.sendRequest('init', {
        serverUrl: "",
        width: width,
        height: height,
        serverPort: self.server.locals.port,
        serverPath: self.server.locals.path
    }, function() {
        self.timeCycleInterval = setInterval(function() {
            var elapsedTime = (new Date()).getTime() - self.previousTime;
			self.previousTime = (new Date()).getTime() ;
			
            self.timeCycleRequest(elapsedTime);

        }, self.gameInfo.frameDuration ? self.gameInfo.frameDuration : 50); // if no other frame duration is specified the frame duration is 1 / 20 of a second, i.e. 50 milliseconds

    });

};


HttpProtocol.prototype.timeCycleRequest = function(elapsedTime) {

    // most of this function is just  error checking
    // in essence it does two things: 
    // 1. ask for a timeCycle
    // 2. actually load the next frame

    var self = this;

    this.sendRequest('timeCycle', { // ask for a timeCycle
        elapsedTime: elapsedTime
    }, function(queryData) {

        var obj = JSON.parse(queryData); // get the next frame

        if( obj.type == undefined ) { this.sendError( 'GameExecuter.timeCycleRequest: type undefined in response timeCycleRequest' ) ; return ; }

        switch( obj.type )
            {
             case "bitmap" :

             	console.log( obj.content ) ;

				self.onFrame( obj.content ) ;

                
                break ;
             default:
                this.sendError( 'GameExecuter.timeCycleRequest: unknown message type: ' + obj.type ) ;
                return ;
            }

        console.log( 'TIME_CYCLE COMPLETE' ) ; 
    });

};



HttpProtocol.prototype.stopRequest = function(callback) {
    var self = this;
    clearInterval(this.timeCycleInterval);

    this.sendRequest('stop', '', function() {
        callback();
    });

};

HttpProtocol.prototype.sendRequest = function(path, message, callback) {

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


HttpProtocol.prototype.sendError = function( errorMessage ) {

    console.log( errorMessage ) ;
    
    this.sendRequest( 'error', errorMessage, function() {} ) ;

} ;

module.exports = HttpProtocol ;