var AbstractScreen = require('./AbstractScreen');
var http = require('http');
var querystring = require('querystring');


function GameAPI() {}

GameAPI.prototype.init = function( port, Messenger, Codec ) // initCallback, timeCycleCallback, stopCallback, introducePlayerCallback, removePlayerCallback, playerCommandCallback )
    {	
   	 this.messenger 	= ( new Messenger() ).initServer( port, this.onMessage.bind( this ) ) ;
	 this.codec 		= ( new Codec() ).init() ;
     return this ;
    } ;
GameAPI.prototype.onMessage = function( message )
	{
	 var o  = this.codec.toObject( message ) ;
	
	 console.log( "onMessage " + o.type) ;
	
	 switch( o.type )
		{
		 case "init" : 
			console.log( 'init case statement') ;
			this.initRequest( o.width, o.height ) ; 				break ;
		 case "stop" : this.stop() ;									break ;
		 case "introducePlayer": this.introducePlayer( o.playerId ) ; 	break ;
		 case "removePlayer": this.removePlayer( o.playerId ) ;			break ;
		 case "playerCommand": this.playerCommand( o.command ) ;		break ;
		}
	} ;

GameAPI.prototype.initRequest = function( width, height)
	{
	 console.log( 'initRequest' ) ;
	 this.screen = (new AbstractScreen()).init( width, height); 
	
	 this.start( width, height ) ;
	}

GameAPI.prototype.killPlayer = function( id )
    {
	 this.messenger.send( this.codec.createKillPlayerRequestMessage( id ) ) ;	     
    } ;

GameAPI.prototype.sendFrame = function() 
	{
	 this.messenger.send( this.codec.createBitmapMessage( this.screen.toObject() ) ) ;	
	} ;

module.exports = GameAPI ;


