
define( [ 'serialport' ], function( serial ) 
{
function ArduinoScreen() {} ;

ArduinoScreen.prototype.init = function( serialString, width, height ) 
    {
     this.width = width ;
     this.height = height ;
     
     
     
     this.sentMessageCount = 0 ;
     
     // '/dev/tty.ARDUINOBT-BluetoothSeri'
     this.serial = new serial.SerialPort( serialString,
        {
         baudrate: 115200
        }) ;
  
       //  this.serial.write( String.fromCharCode( 3 ) + String.fromCharCode( 0 ) + String.fromCharCode(0   )+ String.fromCharCode( 2 ) ) ;
  
     this.sendQueue = [] ;
     
     
     var self = this ;
     this.serial.on( 'data', function( data )
        {
         this.sentMessageCount = 0 ;

         // console.log( data.toString() ) ;
         // self.messageInTransitCount-= data.toString().length ;
        
         self.flushSendQueue() ;
        } ) ;

     
     /*
     var self = this ;
     this.sendProcess = setInterval( function()
        {
         self.serial.write( 
        
        }, 30 ) ;
     */
     
     /*
     var self = this ;
     this.serial.on( 'data', function( data )
        {
         // console.log( data.toString() ) ;
         self.messageInTransitCount-= data.toString().length ;
        
         self._sendNext() ;
        } ) ;
  */
     console.log( 'INIT' ) ;
  
     this.pixelMap = new Array( width ) ;
     for( var x = 0 ; x < width ; x++ ) 
        {
         this.pixelMap[ x ] = [] ;
         for( var y = 0 ; y < height ; y++ )
            {
             this.setColor( x, y, [ 0, 0, 0 ] ) ;
            }
        }
       console.log( 'END INIT' ) ;

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
    
     this.pixelMap[ x ][ y ] = color ;

     console.log( 'x: ' + x +  ' y '  + y + ' time ' + ( new Date() ).getTime() ) ; 
    
   //  console.log( 'x y color ' + x + ' ' + y + ' ' + Math.floor( 200 * color[ 0 ] ) + ' ' + Math.floor( 200 * color[ 1 ] ) + ' ' + Math.floor( 200 * color[ 2 ] ) ) ;
     var rowStartIndex           = x * this.height ;
   
     var relativeColumnIndex ;
     
     if( ( x % 2 ) == 1 )
       relativeColumnIndex = y ;
     else
       relativeColumnIndex = this.height - 1 - y ;
     
   //  console.log( 'rowStartIndex ' + rowStartIndex ) ;
   //  console.log( 'relativeColumnIndex ' + relativeColumnIndex ) ;
            
     var i = rowStartIndex + relativeColumnIndex ;
    
   //  console.log( 'index ' +i ) ;
    /*
     var colorString = String.fromCharCode( Math.floor( 200 * color[ 0 ] ) ) + String.fromCharCode( Math.floor( 200 * color[ 1 ] )  )+ String.fromCharCode( Math.floor( 200 * color[ 2 ] ) ) ;
     
     if( color[ 0 ] == 0 && color[ 1 ] == 0 && color[ 2 ] == 0 )
        colorString = String.fromCharCode( 201 ) + String.fromCharCode( 201  )+ String.fromCharCode( 201 ) ;
    */
    
     var putPixelCommand = new Buffer( 4 ) ;
    
     putPixelCommand[ 0 ] = i ;
     
     putPixelCommand[ 1 ] = Math.floor( 250 * color[ 0 ] ) ;
     putPixelCommand[ 2 ] = Math.floor( 250 * color[ 1 ] ) ;
     putPixelCommand[ 3 ] = Math.floor( 250 * color[ 2 ] ) ;
     

     console.log( 'putPixelCommand' ) ;
     
     console.log( putPixelCommand ) ;
     
    //  var str = String.fromCharCode( i ) + colorString ;
    
    
    // var str = String.fromCharCode( 3 ) + String.fromCharCode( 0 ) + String.fromCharCode(0   )+ String.fromCharCode( 2 ) ;

    
    // console.log( 'string ' + str ) ;
    
     // this.serial.write( str ) ;

    // this.send( str ) ;
     this.send( putPixelCommand ) ;

      // this.socketSet.emit( 'BrowserScreen.setColor', { x: x, y: y, color: color } ) ;
    } ;


 ArduinoScreen.prototype.toObject = function()
    {
     return this.pixelMap ;
    } ;


 ArduinoScreen.prototype.fromObject = function( arduinoScreenAsObject )
    {
 //    this.pixelMap = arduinoScreenAsObject ;
     
     for( var x = 0 ; x < arduinoScreenAsObject.length ; x++  )
     for( var y = 0 ; y < arduinoScreenAsObject[0].length ; y++ )
        {
         console.log( 'x ' + x + ' y ' + y + ' rgb ' + arduinoScreenAsObject[ x ][ y ] ) ;
         this.setColor( x, y, arduinoScreenAsObject[ x ][ y ] ) ;
        }
        
    // this.sendPixelMap() ;
    } ;

/*
 ArduinoScreen.prototype.sendPixelMap = function()
    {
     for( var x in this.pixelMap )
     for( var y in this.pixelMap[ x ] )
        this.setColor( x, y, this.pixelMap[ x ][ y ] ) ;
    }
*/
return ArduinoScreen ;
} ) ;