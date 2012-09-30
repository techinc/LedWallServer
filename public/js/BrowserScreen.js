

function BrowserScreen() { console.log( 'browser screen constructed' ) ; } ;

BrowserScreen.prototype.init = function( tileWidth, columnCount, rowCount ) 
    {
     console.log( 'BrowserScreen.prototype.init' ) ;
     
     // the screen is an array of squares drawn by js library raphael
     
     var paper = Raphael(0, 0, tileWidth * columnCount, tileWidth * rowCount ) ; 
     
     
     // here the squares are defined and drawn. At setColor later on in the code, the squares can be assigned new colors
     this.tileTable = [] ;
     
     for( var x = 0 ; x < columnCount ; x++ )
        {
         this.tileTable[ x ] = [] ;
         for( var y = 0 ; y < rowCount ; y++ )
            {
             this.tileTable[ x ][ y ] = paper.rect( x * tileWidth, y * tileWidth, tileWidth, tileWidth ) ;
             this.tileTable[ x ][ y ].attr( 'fill', '#000000' ) ;
            } 
        } 
        
     return this ;
    } ;

BrowserScreen.prototype.setColor = function( x, y, color )
    {
     // assign color to the right raphael square in the table.
     this.tileTable[ x ][ y ].attr( 'fill', 'rgb( ' + color[ 0 ] + ', ' + color[ 1 ] + ', ' +  color[ 2 ] + ' )' ) ;
    } ;

BrowserScreen.prototype.executeCommand = function( hexString )
    {
     // the command is a hex value in a string string:xyrgb 
     // where x and y consume on char and rgb consume 2 chars
     // each of these is decoded into a javascript number
     this.setColor( 
        this.decodeFromHexString( hexString[ 0 ] ),
        this.decodeFromHexString( hexString[ 1 ] ),
        [ this.decodeFromHexString( hexString[ 2 ] +  hexString[ 3 ] ),
          this.decodeFromHexString( hexString[ 4 ] +  hexString[ 5 ] ),
          this.decodeFromHexString( hexString[ 6 ] +  hexString[ 7 ] ) ] ) ;
//     var x = this.
    } ;

BrowserScreen.prototype.fromHexLetter = function( hexLetter )
    {
     switch( hexLetter ) // decode the hex letter
        {
         case 'a' : return 10 ;
         case 'b' : return 11 ;
         case 'c' : return 12 ;
         case 'd' : return 13 ;
         case 'e' : return 14 ;
         case 'f' : return 15 ;
        }
    
     return parseInt( hexLetter ) ;
    } ;



BrowserScreen.prototype.decodeFromHexString = function( hexString )
    {
     var val = 0 ;
     
     for( var i = hexString.length - 1 ; i >= 0 ; i-- )
        {
         val *= 16 ; // move all hex values one hex digit higher
         val += this.fromHexLetter( hexString.charAt( i ) ) ; // and decode the next hex digit
        }
    
     return val ; // then finally return the result
    } ;
