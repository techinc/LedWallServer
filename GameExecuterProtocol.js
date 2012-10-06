
var SocketMessenger = require( './SocketMessenger' ) ;

function GameExecuterProtocol() {}


GameExecuterProtocol.prototype.init = function( messenger, codec, onKillPlayer, onFrame ) {

	// a GameExecuterProtocol uses a messenger and codec to send an receive messages
	
	// the messager packages, sends, unpackages, and receives messages
	// the codec translates function calls to the strings that must be sent 

	this.messenger = messenger ;
	this.codec = codec ;
	
	// A GameExecuterProtocol raises two events, received from the game:

	this.onKillPlayer = onKillPlayer ;
	this.onFrame 	  = onFrame ;	
	
	return this ;
} ;
/*
Whenever the messenger receives a message processMessage is called.

processMessage decodes and dispatches the returned data to the appropriate eventHandler
*/
GameExecuterProtocol.prototype.processMessage = function( messageBuffer ) {
	var message = this.codec.toObject( messageBuffer.toString() ) ;
	
	switch( message.type ) {
		case 'bitmap' :
			this.onFrame( message.content ) ;	
			break ;
		case 'killPlayer':
			this.onKillPlayer( message.playerId ) ;
			break ;
		default:
			this.sendError( 'GameExecuterProtocol.processMessage: Unknown messageType' ) ;
	}	
} ;


// don't know if this function is ever called
GameExecuterProtocol.onError = function( message )
	{
	 this.messenger.send( this.codec.encodeErrorMessage( message ) ) ;
	}

// these are the function calls that are encoded and sent.

GameExecuterProtocol.prototype.initRequest = function( width, height, serverPort, serverPath ) {
	this.messenger.send( this.codec.createInitRequestMessage( width, height, serverPort, serverPath ) ) ;
} ;

GameExecuterProtocol.prototype.stopRequest = function( callback ) {
	this.messenger.send( this.codec.createStopRequestMessage(), callback ) ;
} ;

GameExecuterProtocol.prototype.introducePlayerRequest = function(playerId) {
	
	this.messenger.send( this.codec.createIntroducePlayerRequestMessage( playerId ) ) ;
} ;


GameExecuterProtocol.prototype.removePlayerRequest = function( playerId ) {
	this.messenger.send( this.codec.createRemovePlayerRequestMessage( playerId ) ) ;
} ;


GameExecuterProtocol.prototype.playerCommand = function( command ) {
	this.messenger.send( this.codec.createPlayerCommandRequestMessage(  command ) ) ;
} ;


GameExecuterProtocol.prototype.sendError = function( message ) {
	this.messenger.send( this.codec.createErrorRequestMessage(  message ) ) ;
} ;

module.exports = GameExecuterProtocol ;
