
define( [ './AbstractScreen', 'serialport' ], function(  AbstractScreen, serial  ) 
{

function ArduinoScreen() {} ;

ArduinoScreen.prototype = new AbstractScreen() ;

ArduinoScreen.prototype.init = function( serialString, width, height ) 
    {
     
     this.sentMessageCount = 0 ;
     
     this.serial = new serial.SerialPort( serialString,
        {
         baudrate: 115200
        }) ;
  
  
     this.sendQueue = [] ;
     
     
     var self = this ;
     this.serial.on( 'data', function( data )
        {
         this.sentMessageCount = 0 ;
        
         self.flushSendQueue() ;
        } ) ;
  
     AbstractScreen.prototype.init.call( this, width, height ) ;

     return this ;
    } ;


ArduinoScreen.prototype._sendNext = function()
    {
     while( this.messageInTransitCount < 10 )
        {
         if( this.sendQueue.length == 0 ) return ;
     
         var message = this.sendQueue.shift() ;
     
         this.serial.write( message ) ;
         this.messageInTransitCount++ ;
        }
    } ;


ArduinoScreen.prototype.send = function( message )
    {
     this.sendQueue.push( message ) ;
    
     this.sentMessageCount++ ;
     if( this.sentMessageCount <= 10 )
        {
         this.flushSendQueue() ;
        }
    } ;


ArduinoScreen.prototype.flushSendQueue = function()
    {
     this.sentMessageCount = 0 ;
    
     while( this.sendQueue.length > 0 )
        this.serial.write( this.sendQueue.shift() ) ;
    } ;


ArduinoScreen.prototype.setColor = function( x, y, color )
    {
     AbstractScreen.prototype.setColor.call( this, x, y, color ) ;
    
     // console.log( 'x: ' + x +  ' y '  + y + ' time ' + ( new Date() ).getTime() ) ; 
    
     var rowStartIndex           = x * this.height ;
   
     var relativeColumnIndex ;
     
     if( ( x % 2 ) == 1 )
       relativeColumnIndex = y ;
     else
       relativeColumnIndex = this.height - 1 - y ;
     
            
     var i = rowStartIndex + relativeColumnIndex ;

    
     var putPixelCommand = new Buffer( 4 ) ;
    
     putPixelCommand[ 0 ] = i ;
     
     putPixelCommand[ 1 ] = Math.floor( 250 * color[ 0 ] ) ;
     putPixelCommand[ 2 ] = Math.floor( 250 * color[ 1 ] ) ;
     putPixelCommand[ 3 ] = Math.floor( 250 * color[ 2 ] ) ;
     

     // console.log( 'putPixelCommand' ) ;
     
     // console.log( putPixelCommand ) ;
     
     this.send( putPixelCommand ) ;
    } ;


return ArduinoScreen ;
} ) ;