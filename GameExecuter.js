var GameExecuterProtocol = require( './GameExecuterProtocol' ) ;

function GameExecuter() {}


GameExecuter.prototype.init = function(screen, gameInfo, sockets, server, playerQueueManagement) {
    var self = this;

    this.screen = screen;

    this.gameInfo = gameInfo;
    
    this.sockets = sockets;

	// the protocol does the actual communication with the game.
	this.protocol = this.createProtocol( gameInfo, server, this.onKill.bind( this ), this.onFrame.bind( this ) ) ;

	// initRequest is the first request sent to a game.
    this.protocol.initRequest( this.screen.width, this.screen.height );

    this.playerQueueManagement = playerQueueManagement;
   
    // there is a playerLimit that is not 0, it is a single/multiplayer game.
    //      have playerQueueManagement start the game
    //      every time the playerQueueManagement thinks it is necessary to introduce a new player the passed callback is called
    //          The passed callback, actually informs the game that the player should be introduced, and sets up streaming 
    //          controller input of the new player to the game.
    
    if (gameInfo.playerLimit) this.playerQueueManagement.startGame(gameInfo.playerLimit, function(id) {        
        self.protocol.introducePlayerRequest( id );
        
        var clients = self.sockets.clients() ;
        
        for( var i in clients )
            if( clients[ i ].id == id )                
                 self.streamControllerInput( clients[ i ], id ) ;             
    }, function( id ) { // but when the player disconnects send a request to remove the player
	     	self.protocol.removePlayerRequest(id);
	});


    return this;
} ;

GameExecuter.prototype.stop = function( callback )
{
	this.protocol.stopRequest( callback ) ;
} ;
GameExecuter.prototype.createProtocol = function( gameInfo, server, onKill, onFrame ) {
	// based on the gameInfo (taken from the file in ./games) the protocol is selected
	
	// there are two types of protocols: integrated and composite protocols
	
	// a composite protocol consists of a messenger and a codec
	// the codec encodes and decodes string respresentations for requests to and from a game
	// the messenger packages, sends, receives and unpackages messages
	
	// an integrated protocol takes care of both 
	
	// if no messenger or codec are specified, an integrated protocol is required, 
	// assume the HttpProtocol
	if( gameInfo.messenger === undefined && gameInfo.codec === undefined )
		{
		 var HttpProtocol = require( './HttpProtocol' ) ;
	
		 return ( new HttpProtocol() ).init( gameInfo, server, onKill, onFrame ) ;
	 	}
	
	
	// otherwise a composite protocol is required, 
	// so select the correct messenger and codec (currently only two exist)
	var Messenger ;
	var Codec ;
	switch( gameInfo.messenger )
		{
		 case "SocketMessenger" :
			Messenger = require( './SocketMessenger' ) ; // a messenger that uses sockets
			break ;
		}
		
	switch( gameInfo.codec )
		{
		 case "JSONCodec":
			Codec = require( './JSONCodec' ) ; // a codec that is based on json
			break ;
		}
	
	// then create a new protocol using the messenger and the codec
	var gameExecuterProtocol = new GameExecuterProtocol() ;	
	var messenger 	= ( new Messenger() ).initClient( gameInfo.port, gameInfo.host, gameExecuterProtocol.processMessage.bind( gameExecuterProtocol ) ) ;
	var codec 		= ( new Codec() ).init()  ;
	
	return gameExecuterProtocol.init( messenger, codec, onKill, onFrame ) ;
} ;


GameExecuter.prototype.onKill = function( playerId )
	{
	 var clients = this.sockets.clients() ;
	 for( var i in clients )
	    if( clients[ i ].id == playerId )      
	        this.stopStreamingControllerInput( clients[ i ] ) ;
		
	 this.playerQueueManagement.killPlayer( playerId ); // don't forget to remove it from playerQueueManagement as well	
	} ;

GameExecuter.prototype.onFrame = function( frame )
	{
	 var result = this.screen.validObject( frame ) ;
		
	  if( result != 'correct' ){ this.protocol.sendError( result ) ; }
      else
     	this.screen.fromObject(frame); // actually load the next frame	
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
    
    this.protocol.introducePlayerRequest( playerId ) ; // send a request to introduce the player

    var client = this.getSocketById(playerId); 
    client.on('disconnect', function() { // but when the player disconnects send a request to remove the player
        self.protocol.removePlayer(playerId);
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
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'up',
            event: message
        });
    });
    client.on('controllerDown', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'down',
            event: message
        });
    });
    client.on('controllerLeft', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'left',
            event: message
        });
    });
    client.on('controllerRight', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'right',
            event: message
        });
    });

    client.on('controllerA', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'a',
            event: message
        });
    });
    client.on('controllerB', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'b',
            event: message
        });
    });
    client.on('controllerX', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'x',
            event: message
        });
    });
    client.on('controllerY', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'y',
            event: message
        });
    });

    client.on('controllerStart', function(message) {
        self.protocol.playerCommand( {
            playerId: playerId,
            button: 'start',
            event: message
        });
    });

};


module.exports = GameExecuter;