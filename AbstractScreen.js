function AbstractScreen() {};

AbstractScreen.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

	console.log( 'ABSTRACT SCREEN ' + width + ' ' + height )

    this.pixelMap = new Array(width);
    for (var x = 0; x < width; x++) {
        this.pixelMap[x] = [];
        for (var y = 0; y < height; y++) {
            this.setColor(x, y, [0, 0, 0]);
        }
    }
    return this;
};

AbstractScreen.prototype.setColor = function(x, y, color) {
    this.pixelMap[x][y] = color;
};


AbstractScreen.prototype.toObject = function() {
    return this.pixelMap;
};


AbstractScreen.prototype.fromObject = function(abstractScreenAsObject) {
    for (var x = 0; x < abstractScreenAsObject.length; x++)
    for (var y = 0; y < abstractScreenAsObject[0].length; y++) {
        this.setColor(x, y, abstractScreenAsObject[x][y]);
    }
};


AbstractScreen.prototype.validObject = function( obj )
{
    if( obj == undefined ) return "AbstractScreen: column set is undefined" ;

    if( obj.constructor != Array ) return "AbstractScreen: column set is not an array" ;
        
    for( var x = 0 ; x < this.width ; x++ )
        {
         if( obj[ x ] == undefined ) return "AbstractScreen: column " + x + " is undefined"
         if( obj[ x ].constructor != Array ) return "AbstractScreen: column " + x + " is not an array" ;
        
         for( var y = 0 ; y < this.height ; y++ )
            {
             if( obj[ x ][ y ] == undefined ) return "AbstractScreen: color at " + x + " " + y + " is undefined"
             if( obj[ x ][ y ].constructor != Array ) return "AbstractScreen: position " + x + " " + y + " is not an array" ;
            
             if( obj[ x ][ y ].length != 3 ) return "AbstractScreen: wrong number of colors" ;
             
             if( isNaN( obj[ x ][ y ][ 0 ] ) ) return "AbstractScreen: red sub pixel at "   + x + " " + y+" has incorrect type: " + typeof obj[ x ][ y ] ; 
             if( isNaN( obj[ x ][ y ][ 1 ] ) ) return "AbstractScreen: green sub pixel at " + x + " " + y+" has incorrect type: " + typeof obj[ x ][ y ] ; 
             if( isNaN( obj[ x ][ y ][ 2 ] ) ) return "AbstractScreen: blue sub pixel at "  + x + " " + y+" has incorrect type: " + typeof obj[ x ][ y ] ; 

            }
        
        }
    return "correct" ;
} ;


AbstractScreen.prototype.clear = function()
    {
     for (var x = 0; x < this.pixelMap.length; x++)
     for (var y = 0; y < this.pixelMap[0].length; y++) 
        this.setColor(x, y, [ 0, 0, 0 ]);
    
    } ;

module.exports = AbstractScreen;