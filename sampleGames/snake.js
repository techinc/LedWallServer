
var GameAPI = require( '../GameAPI' ) ;


function Map() {}

Map.prototype.init = function( width, height )
    {
     this.width  = width ;
     this.height = height ; 
    
     this.tileTable = [] ;
     
     for( var x = 0 ; x < width ; x++ )
        {
         var nextRow = [] ;
         for( var y = 0 ; y < height ; y++ )
            nextRow.push( null ) ;
        
         this.tileTable.push( nextRow ) ;
        }
    
     return this ;
    } ;


Map.prototype.startingLocation = function()
    {
     do
        {
         var x = Math.floor( Math.random() * this.width ) ;
         var y = Math.floor( Math.random() * this.height ) ;
        
        } while( this.tileTable[ x ][ y ] ) ;
        
        
     return { x: x, y: y } ;
    } ;


function MapObject() {}

MapObject.prototype.init = function( map, x, y )
    {
     this.map = map ;
    
     this.x = x ;
     this.y = y ;
     
     
     
     this.map.tileTable[ this.x ][ this.y ] = this ;
     
     this.type = [ 'MapObject' ] ;
     return this ;
    } ;


MapObject.prototype.destroy = function()
    { 
     this.map.tileTable[ this.x ][ this.y ] = null ;
    } ;
    

MapObject.prototype.moveTo = function( x, y )
    {    
     this.map.tileTable[ this.x ][ this.y ] = null ;
     this.x = x ;
     this.y = y ;
     
     this.map.tileTable[ this.x ][ this.y ] = this ;
    } ;

function Apple() {} 

Apple.prototype = new MapObject() ;

Apple.prototype.init = function( map, x, y )
    {
     MapObject.prototype.init.call( this, map, x, y ) ;
     
     this.type.unshift( 'Apple' ) ;  
     
     return this ;  
    } ;


Apple.prototype.respawn = function()
    {
     var nextLocation = this.map.startingLocation() ;
     
     this.moveTo( nextLocation.x, nextLocation.y ) ;
    } ;
    
    
Apple.prototype.draw = function( screen )
    {
     screen.setColor( this.x, this.y, [1,0,0] ) ;
    
    } ;

function SnakeSegment() {}

SnakeSegment.prototype = new MapObject() ;

SnakeSegment.prototype.init = function( map, x, y )
    {
     MapObject.prototype.init.call( this, map, x, y ) ;
     
     this.type.unshift( 'SnakeSegment' ) ;
     
     return this ;
    } ;


function SnakeHead() {}

SnakeHead.prototype = new SnakeSegment() ;

SnakeHead.prototype.init = function( map, x, y, snake )
    {
     SnakeSegment.prototype.init.call( this, map, x, y ) ;
     
     this.snake = snake ;
     
     this.type.unshift( 'SnakeHead' ) ;
     
     return this ;
    } ;




function Snake() {}

Snake.prototype.init = function( onKill, map, startingLength, skin )
    {
     this.onKill = onKill ;
     this.draw = skin ;
    
     this.requiredGrowth = startingLength ;
     this.map = map ;
     
     var startingLocation = this.map.startingLocation() ;
     
     this.segmentSet = [ ( new SnakeHead() ).init( map, startingLocation.x, startingLocation.y, this ) ] ;
     
     this.vx = 1 ;
     this.vy = 0 ;
     
     return this ;
    } ;

Snake.prototype.timeCycle = function( screen )
    {
     if( this.vx || this.vy )
        {
         var nextX = this.segmentSet[ 0 ].x + this.vx ;
         var nextY = this.segmentSet[ 0 ].y + this.vy ;
        
         while( nextX < 0 ) nextX += this.map.width ;
         while( nextY < 0 ) nextY += this.map.height ;
            
         nextX = nextX % this.map.width ;
         nextY = nextY % this.map.height ;
         console.log( 'before check' ) ;
         if( this.map.tileTable[ nextX ][ nextY ] != null )
            {
             console.log( 'switch condition '+  this.map.tileTable[ nextX][ nextY ].constructor == SnakeSegment + ' ' + this.map.tileTable[ nextX ][ nextY ].constructor.name ) ;
             
             switch( this.map.tileTable[ nextX][ nextY ].type[ 0 ] )
                {
                 case 'Apple' :
                    this.map.tileTable[ nextX][ nextY ].respawn() ;
                    this.requiredGrowth++ ; break ;
                 case 'SnakeHead' :
                    console.log( 'SnakeHead' ) ;
                    this.map.tileTable[ nextX][ nextY ].snake.kill() ;
                    this.kill() ;

                    return ;
                 case 'SnakeSegment' :
                    console.log( 'SnakeSegment' ) ;
                    
                    this.kill() ;
                    
                    return ;
                }
            
            }
         console.log( 'after check ' ) ;
         for( var i = 0 ; i < this.segmentSet.length ; i++ )
            {
             var previousX = this.segmentSet[ i ].x ;
             var previousY = this.segmentSet[ i ].y ;  
            
             while( nextX < 0 ) nextX += this.map.width ;
             while( nextY < 0 ) nextY += this.map.height ;
            
             nextX = nextX % this.map.width ;
             nextY = nextY % this.map.height ;
             
             this.segmentSet[ i ].moveTo( nextX, nextY ) ;
             
             console.log( 'cname = ' + this.map.tileTable[ nextX ][ nextY ].type[ 0 ] ) ;
             
             nextX = previousX ;
             nextY = previousY ;            
            } ;
            
         if( this.requiredGrowth ) 
            {
             this.segmentSet.push( ( new SnakeSegment() ).init( this.map, nextX, nextY ) ) ;
             this.requiredGrowth-- ;
            }
         
        }
        
     this.draw( screen ) ;
    } ;


Snake.prototype.die = function() 
    {
     for( var i in this.segmentSet ) this.segmentSet[ i ].destroy() ;
    } ;
    

Snake.prototype.kill = function() 
    {
     this.die() ;
     this.onKill() ;
    } ;



Snake.color = function( color )
    {
     return function( screen )
        {
         for( var i in this.segmentSet )
            screen.setColor( this.segmentSet[ i ].x, this.segmentSet[ i ].y, color ) ;
        } ;
    } ;


function Game() {}

Game.STARTING_LENGTH = 3 ;

Game.prototype = new GameAPI() ;


Game.prototype.start = function( width, height ) 
    {
    
     this.map = ( new Map() ).init( width, height ) ;
    
     this.snakeSet = {} ;
     
     var p = this.map.startingLocation() ;
     
     this.apple = ( new Apple() ).init( this.map, p.x, p.y ) ;


	 var self = this ;
	 this.timeCycleInterval = setInterval( function() {
		console.log( 'time cycle' ) ;
		self.timeCycle( self.screen )
	 }, 200 ) ;
    } ;


Game.prototype.timeCycle = function( screen )
    {
     screen.clear() ;
    
     for( var i in this.snakeSet )
        {
         this.snakeSet[ i ].timeCycle( screen ) ;
        }
        
     this.apple.draw( screen ) ;

	 this.sendFrame() ;
    } ;


Game.prototype.stop = function( data )
    {
     
    } ;

Game.prototype.introducePlayer = function( playerId )
    {
     console.log( 'INTRODUCE PLAYER ' + playerId ) ;
    
     var self = this ;
    
     this.snakeSet[ playerId ] = ( new Snake() ).init( 
        function() { self.removePlayer( playerId ) ; self.killPlayer( playerId ) ; },
        this.map, Game.STARTING_LENGTH, Snake.color( [ Math.random(), Math.random(), Math.random() ] ) ) ;
    } ;


Game.prototype.removePlayer = function( playerId )
    {
     if( !this.snakeSet[ playerId ] ) return ;
    
     this.snakeSet[ playerId ].die() ;
    
     delete this.snakeSet[ playerId ] ;
    } ;
    
Game.prototype.playerCommand = function( command )
    {
     console.log( command ) ;
    
     var player = this.snakeSet[command.playerId];
     
     if( !player ) { console.log( 'NO PLAYER' ) ; return ; }
     
     if( command.event == 'down' )
        {
         switch( command.button )
            {
             case 'up':      if( player.vy !=  1 ) { player.vy = -1 ; player.vx =  0 ; } break ;
             case 'down':    if( player.vy != -1 ) { player.vy =  1 ; player.vx =  0 ; } break ;  
             case 'left':    if( player.vx != -1 ) { player.vx =  1 ; player.vy =  0 ; } break ;
             case 'right':   if( player.vx !=  1 ) { player.vx = -1 ; player.vy =  0 ; } break ;
            }
        }
    } ;

game = ( new Game() ).init( 7979, require( '../SocketMessenger'), require( '../JSONCodec') ) ;







