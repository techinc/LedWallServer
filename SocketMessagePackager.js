var net = require( 'net' ) ;

function SocketMessagePackager() {}

SocketMessagePackager.prototype.initServer = function( port ) {
	var server = net.createServer(function(c) { //'connection' listener
	  this.socket = c ;
	
	  c.on('end', function() {
	    console.log('server disconnected');
	  });
	});
	server.listen(port, function() {} ) ;
} ;


SocketMessagePackager.prototype.initClient = function() {}

	this.socket = new net.Socket();
	this.socket.connect( gameInfo.port, gameInfo.host, function() {
	        console.log('Connected!');
	    });
	
	this.startReceiving() ;
} ;

SocketMessagePackager.prototype.startReceiving = function() {
	var READ_FIRST_LENGTH_BYTE = 0 ;
	var READ_SECOND_LENGTH_BYTE = 1 ;
	var READ_MESSAGE = 2 ;

	var lengthBuffer = new Buffer() ;
	var length ;

	var messageBuffer ;
	var state = 0 ;

	var messageIndex ;
	this.socket.on( 'data', function( data ) {
		
		for( var i = 0 ; i < data.length ;  ) {
			 switch( state ) {		
				case READ_FIRST_LENGTH_BYTE :
					lengthBuffer[ 0 ] = data[ i ] ;
					state++ ;
					
					break ;
				case READ_SECOND_LENGTH_BYTE :
					lengthBuffer[ 1 ] = data[ i ] ;
					length = lengthBuffer.readUInt16LE( 0 ) ;
					messageBuffer = new Buffer( length ) ;
					messageIndex = 0 ;
					state++ ;
					
					break ;
				case READ_MESSAGE :
					messageBuffer[ messageIndex ] = data[ i ] ;
					messageIndex++ ;
					if( messageBuffer.length == messageIndex )
						{ 
						 self.processMessage( messageBuffer ) ;
						 state = READ_FIRST_LENGTH_BYTE ;
						}
						
					break ;
			}			 	
		}

	} ) ; 
	
} ;



SocketMessagePackager.prototype.send = function( object ) {
	var payload = JSON.stringify( object ) ;
	// a message consists of a 2 byte unsigned int encoding payload length followed by the payload as an ascii string
	
	var buffer = new Buffer( payload.length + 2 ) ;

	buffer.writeUInt16LE( payload.length, 0 ) ;
	buffer.write( payload, 2, payload.length, 'ascii' ) ;

	this.socket.write( buffer ) ;
} ;
