var net = require( 'net' ) ;

/* SocketMessenger offers sockets based communication */

function SocketMessenger() {}


SocketMessenger.prototype.initClient = function( port, host, onMessage ) {
	console.log( 'PORT ' + port ) ;
	
	// create a basic socket
	this.socket = new net.Socket();
	this.socket.connect( port, host, function() {
	        console.log('Connected!');
	    });
	
	// register event handler callback
	this.onMessage = onMessage ;
	
	// and receive messages
	this.startReceiving() ;
	
	return this ;
} ;

SocketMessenger.prototype.initServer = function( port, onMessage ) {
	// create a server at port
	// and process any incoming message using onMessage
	
	// whenever the server connects, store the socket so that we can 
	// talk with it the same way we do with the client
	// and start receiving messages from it
	
	console.log( 'PORT ' +port) ;
	var self = this ;
	var server = net.createServer(function(c) { //'connection' listener
	  console.log( 'connected' ) ;
	  self.socket = c ;
	  self.onMessage = onMessage ; 
	
	  self.startReceiving() ;
	
	  c.on('end', function() {
	    console.log('server disconnected');
	  });
	});
	server.listen(port, function() { console.log( 'listen') ;} ) ;
	
	return this ;
} ;



SocketMessenger.prototype.send = function( payload, callback ) {
	// a message consists of a 2 byte unsigned int encoding payload length followed by the payload as an ascii string
	var buffer = new Buffer( payload.length + 2 ) ;

	buffer.writeUInt16LE( payload.length, 0 ) ;
	buffer.write( payload, 2, payload.length, 'ascii' ) ;

	this.socket.write( buffer ) ;
	
	// no need to wait for messages to arrive, correct order is assured by the socket
	// so give the callback that messages arrived immediately
	if( callback ) callback() ;
} ;


SocketMessenger.prototype.startReceiving = function() {
	var self = this ;
	console.log( 'start receiving' ) ;
	var READ_FIRST_LENGTH_BYTE = 0 ;
	var READ_SECOND_LENGTH_BYTE = 1 ;
	var READ_MESSAGE = 2 ;

	var lengthBuffer = new Buffer(2) ;
	var length ;

	var messageBuffer ;
	var state = 0 ;

	var messageIndex ;
	this.socket.on( 'data', function( data ) {
		for( var i = 0 ; i < data.length ; i++ ) {
			 switch( state ) {		
				case READ_FIRST_LENGTH_BYTE :
					lengthBuffer[ 0 ] = data[ i ] ; // first read the first length byte
					state = READ_SECOND_LENGTH_BYTE ; // and set out to read the next byte
					break ;
				case READ_SECOND_LENGTH_BYTE :
				
					lengthBuffer[ 1 ] = data[ i ] ; // then read the second length byte
					length = lengthBuffer.readUInt16LE( 0 ) ; // and then ecode it
					messageBuffer = new Buffer( length ) ; //  and the create a buffer of the required length (and delete the previous message)
					messageIndex = 0 ; //  set messageIndex to the number of data bytes that have been read so far
					state = READ_MESSAGE ; // and continue to read the message
					break ;
				case READ_MESSAGE :
							
					messageBuffer[ messageIndex ] = data[ i ] ; // then keep adding bytes of data to the messageBuffer
					messageIndex++ ;
					
					if( messageBuffer.length == messageIndex ) // and when all required characters for the next message are read
						{ 
						 self.onMessage( messageBuffer ) ; // raise an event to handle the message
						 state = READ_FIRST_LENGTH_BYTE ; // continue to read the next length, the next message
						}
						
					break ;
			}			 	
		}

	} ) ; 
	
} ;

module.exports = SocketMessenger ;