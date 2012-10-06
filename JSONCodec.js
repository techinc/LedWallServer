

function JSONCodec() {}

JSONCodec.prototype.init = function() { return this ; } ;

JSONCodec.prototype.toObject = function( message )
{
	// decoding json messages just requires parsing the messages
	return JSON.parse( message.toString( 'ascii' ) ) ;
}

// the calls that encode all the messages
JSONCodec.prototype.createInitRequestMessage = function( width, height, port, path )
	{
	 return JSON.stringify(
		{
		 type: 'init',
			
		 width: width,
		 height: height,
		 
		 serverPort: port,
		 serverPath: path
		}
	 ) ;
	} ;
	
JSONCodec.prototype.createStopRequestMessage = function()
	{
	 return JSON.stringify(
		{
		 type: 'stop'
		}
	 ) ;
	} ;


JSONCodec.prototype.createIntroducePlayerRequestMessage = function( playerId )
	{
	 return JSON.stringify(
		{
		 type: 'introducePlayer',
		 playerId: playerId
		}
	 ) ;
	} ;


JSONCodec.prototype.createRemovePlayerRequestMessage = function( playerId )
	{
	 return JSON.stringify(
		{
		 type: 'removePlayer',
		 playerId: playerId
		}
	 ) ;
	} ;


JSONCodec.prototype.createPlayerCommandRequestMessage = function( command )
	{
	 return JSON.stringify(
	 	{
		 type: "playerCommand",
		 command: command
		} ) ;	
	} ;


JSONCodec.prototype.createKillPlayerRequestMessage = function( playerId )
	{
	 return JSON.stringify(
		{
		 type: 'killPlayer',
		 playerId: playerId
		}
	 ) ;
	} ;


JSONCodec.prototype.createBitmapMessage = function( content )
	{
	 return JSON.stringify(
		{
		 type: 'bitmap',
		 content: content
		}
	 ) ;
	} ;
	
JSONCodec.prototype.createErrorMessage = function( message )
	{
	 return JSON.stringify(
			{
			 type: "error",
			 message: message
			} ) ;
	} ;
module.exports = JSONCodec ;