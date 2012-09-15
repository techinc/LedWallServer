var io = require( 'socket.io' ) ;

var AbstractScreen = require( './AbstractScreen' ) ;

function RemoteScreen() {} ;

RemoteScreen.prototype = new AbstractScreen() ;

RemoteScreen.prototype.init = function( server, socketPort, width, height ) 
    {
     this.server = server ;
     this.socketSet = io.listen( socketPort ) ; 
     
     server.get('/screen', function(req, res) {

        res.render('browserScreen.html', {port:socketPort, width: width, height: height });

     } ) ;
     
     var self = this ;
     this.socketSet.on( 'connection', function( socket )
        {
         self.sendInitialScreen( socket ) ;
        } ) ;
     
     AbstractScreen.prototype.init.call(this, width, height);

     return this ;
    } ;


RemoteScreen.prototype.setColor = function( x, y, color )
    {
     AbstractScreen.prototype.setColor.call(this, x, y, color);
    
     console.log( 'sending color ' + JSON.stringify( arguments ) ) ;
    
    // this.socketSet.sockets.emit( 'BrowserScreen.setColor', { x: x, y: y, color: color } ) ;
    this.socketSet.sockets.emit( 'p', this.encodeCommand( x, y, color ) ) ;

    } ;


RemoteScreen.prototype.encodeCommand = function( x, y, color )
    {
     var r = this.encodeColorComponent( color[ 0 ] ) ;
     var g = this.encodeColorComponent( color[ 1 ] ) ;
     var b = this.encodeColorComponent( color[ 2 ] ) ;    
     
     var xc = this.encodeCoordinate( x ) ;
     var yc = this.encodeCoordinate( y ) ;
     
     return xc + yc + r + g + b ;
    } ;


RemoteScreen.prototype.encodeColorComponent = function( val )
    {
     val *= 255.9 ;
     var hexString = this.encodeToHexString( val ) ;
     while( hexString.length < 2 ) hexString += '0' ;
     
     return hexString ;
    } ;
    
RemoteScreen.prototype.encodeCoordinate = function( val )
    {
     var hexString = this.encodeToHexString( val ) ;
     while( hexString.length < 1 ) hexString += '0' ;
     
     return hexString ;
    } ;
    
RemoteScreen.prototype.encodeToHexString = function( val )
    {
     if( val < 1 ) 
	return '0' ;

     var hexString = '' ;
    
     while( val >= 1 )
        {
         hexString += this.toHexLetter(  Math.floor( val % 16 ) ) ;
         val /= 16 ;
        } 
    
     return hexString ;
    } ;


RemoteScreen.prototype.toHexLetter = function( val )
    {
     switch( val )
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
     for( var x = 0 ; x < this.pixelMap.length ; x++ )
     for( var y = 0 ; y < this.pixelMap[ x ].length ; y++ )
        socket.emit( 'p', this.encodeCommand( x, y, this.pixelMap[ x ][ y ] ) ) ;        
    } ;
    
module.exports = RemoteScreen ;
