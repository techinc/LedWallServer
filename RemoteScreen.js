var io = require( 'socket.io' ) ;

var AbstractScreen = require( './AbstractScreen' ) ;

function RemoteScreen() {} ;

RemoteScreen.prototype = new AbstractScreen() ;

RemoteScreen.prototype.init = function( server, socketPort, width, height ) 
    {
     this.server = server ;
     this.socketSet = io.listen( socketPort ) ; 
     
     var self = this ;
     this.socketSet.configure( function()
        {
         self.socketSet.set( 'log level', 0 ) ; // kill of logging so it is possible to read your own debug messages
        } ) ;
     
     server.get('/screen', function(req, res) { // add the url of the screen to the server

        res.render('browserScreen.html', {port:socketPort, width: width, height: height }); // and send the correct html template with the dimensions of the screen 
                                                                                            // and the port on which the put pixel commands will be sent to the client

     } ) ;
     
     var self = this ;
     this.socketSet.on( 'connection', function( socket ) // and whenever a new socket connection is established, send the initial screen
        {
         self.sendInitialScreen( socket ) ; 
        } ) ;
     
     AbstractScreen.prototype.init.call(this, width, height);

     return this ;
    } ;


RemoteScreen.prototype.setColor = function( x, y, color )
    {
     AbstractScreen.prototype.setColor.call(this, x, y, color);
    
    
    // this.socketSet.sockets.emit( 'BrowserScreen.setColor', { x: x, y: y, color: color } ) ;
    this.socketSet.sockets.emit( 'p', this.encodeCommand( x, y, color ) ) ; // send an encoded putpixel command

    } ;


RemoteScreen.prototype.encodeCommand = function( x, y, color )
    {
     var r = this.encodeColorComponent( color[ 0 ] ) ; // colors are a 1 byte hex encoded value (ie two hex digits)
     var g = this.encodeColorComponent( color[ 1 ] ) ;
     var b = this.encodeColorComponent( color[ 2 ] ) ;    
     
     var xc = this.encodeCoordinate( x ) ; // a component of a coordinate is a 4 bits hex encoded value (ie one hex digit)
     var yc = this.encodeCoordinate( y ) ;
     
     return xc + yc + r + g + b ; // concatenate the hex values and send them
    } ;


RemoteScreen.prototype.encodeColorComponent = function( val )
    {
     val *= 255.9 ;
     var hexString = this.encodeToHexString( val ) ; // a color is a two digit hex val
     while( hexString.length < 2 ) hexString += '0' ; // if the hex val has one digit, add a 0 in front of it
     
     return hexString ;
    } ;
    
RemoteScreen.prototype.encodeCoordinate = function( val )
    {
     var hexString = this.encodeToHexString( val ) ; 
     while( hexString.length < 1 ) hexString += '0' ; // if the hex val has no digits it is 0, so add "0" to the hexString
     
     return hexString ;
    } ;
    
RemoteScreen.prototype.encodeToHexString = function( val )
    {
     if( val < 1 ) // if the val is lower than 1 return '0' (the code can not encode fractions as hex values
	 return '0' ;

     var hexString = '' ;
    
     while( val >= 1 )
        {
         hexString += this.toHexLetter(  Math.floor( val % 16 ) ) ; // val % 16 filters out the first hex digit as a value ranging from 0 to 15. Encode this value as a hex letter
         val /= 16 ; // and make the next hex digit the first hex digit.
        } 
    
     return hexString ;
    } ;


RemoteScreen.prototype.toHexLetter = function( val )
    {
     switch( val ) // convert a val rangeing from 0 to 15 as a hex val
        {
         case 10 : return 'a' ;
         case 11 : return 'b' ;
         case 12 : return 'c' ;
         case 13 : return 'd' ; 
         case 14 : return 'e' ;
         case 15 : return 'f' ;
         default : return '' + val ;
        }
    } ;



RemoteScreen.prototype.sendInitialScreen = function( socket )
    {
     // send every pixel on the screen to the socket
     for( var x = 0 ; x < this.pixelMap.length ; x++ )
     for( var y = 0 ; y < this.pixelMap[ x ].length ; y++ )
        socket.emit( 'p', this.encodeCommand( x, y, this.pixelMap[ x ][ y ] ) ) ;        
    } ;
    
module.exports = RemoteScreen ;
