
var SocketMessenger = require( './SocketMessenger' ) ;

function SocketProtocol() {}

SocketProtocol.prototype = new SocketMessenger() ;

SocketProtocol.prototype.init = function( gameInfo, server, onKillPlayer, onFrame ) {
	this.gameInfo = gameInfo ;
	this.server = server ;
	this.onKillPlayer = onKillPlayer ;
	this.onFrame 	  = onFrame ;	
} ;

SocketProtocol.prototype.processMessage = function( messageBuffer ) {
	var message = JSON.parse( messageBuffer.toString() ) ;
	
	switch( message.type ) {
		case 'bitmap' :
			this.onFrame( message.content ) ;	
			break ;
		case 'killPlayer':
			this.onKillPlayer( message.playerId ) ;
			break ;
		default:
			this.sendError( 'SocketProtocol.processMessage: Unknown messageType' ) ;
	}	
} ;



SocketProtocol.prototype.initRequest = function( width, height ) {
	this.send( { type: "init", width: width, height: height } ) ;
} ;

SocketProtocol.prototype.stopRequest = function(callback) {
	this.send( { type: "stop" } ) ;
} ;

SocketProtocol.prototype.introducePlayerRequest = function(playerId) {
	
	this.send( { type: "introducePlayer", playerId: playerId } ) ;
} ;


SocketProtocol.prototype.removePlayerRequest = function( playerId ) {
	this.send( { type: "removePlayer", playerId: playerId } ) ;
} ;


SocketProtocol.prototype.playerCommand = function( command ) {
	this.send( { type: "playerCommand", command: command } ) ;
} ;


SocketProtocol.prototype.sendError = function( message ) {
	this.send( { type: "error", message: message } ) ;
} ;


