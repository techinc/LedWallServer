
var GameServerAPI = require( './GameServerAPI' ) ;

var game ; // make the game a global so that everything can access everything (maybe not the best design but let's be practical)

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
     if( this.map.tileTable[ this.x][ this.y ] === this )  
        this.map.tileTable[ this.x ][ this.y ] = null ;
    
     this.x = x ;
     this.y = y ;
     
     this.map.tileTable[ this.x ][ this.y ] = this ;
    } ;


function SolidBlock() {}

SolidBlock.prototype = new MapObject() ;

SolidBlock.prototype.init = function( map, x, y, color )
    {
     MapObject.prototype.init.call( this, map, x, y ) ;
     
     this.type.unshift( 'SolidBlock' ) ;
     
     this.color = color ;
     
     return this ;
    } ;


function WeakBlock() {}

WeakBlock.prototype = new MapObject() ;

WeakBlock.prototype.init = function( map, x, y, color )
    {
     MapObject.prototype.init.call( this, map, x, y ) ;
     
     this.type.unshift( 'WeakBlock' ) ;
     
     this.color = color ;
     
     return this ;
    } ;




function BlastIncrease() {}

BlastIncrease.FRAMES_PER_BLAST_INCREASE = 10 ;

BlastIncrease.prototype = new MapObject() ;

BlastIncrease.prototype.init = function( map, x, y )
    {
     var location = map.startingLocation() ;

     MapObject.prototype.init.call( this, map, location.x, location.y ) ;
     
     this.type.unshift( 'BlastIncrease' ) ;
     
     this.color = [ .7, .7, 0 ] ;
     
     
     game.timeQueue.push( this ) ;
     
     this.framesTillNextBlastIncrease = BlastIncrease.FRAMES_PER_BLAST_INCREASE ;
     
     return this ;
    } ;


BlastIncrease.prototype.timeCycle = function()
    {
     if( this.framesTillNextBlastIncrease-- <= 0 ) 
        {
         this.framesTillNextBlastIncrease = BlastIncrease.FRAMES_PER_BLAST_INCREASE ;
         var location = this.map.startingLocation() ;
         this.moveTo( location.x, location.y ) ;
        }
    
    } ;


function BombIncrease() {}

BombIncrease.FRAMES_PER_BOMB_INCREASE = 10 ;

BombIncrease.prototype = new MapObject() ;

BombIncrease.prototype.init = function( map )
    {
     var location = map.startingLocation() ;

     MapObject.prototype.init.call( this, map, location.x, location.y ) ;
     
     this.type.unshift( 'BombIncrease' ) ;
     
     this.color = [ 0, .7, 0 ] ;
     
     game.timeQueue.push( this ) ;
     
     this.framesTillNextBombIncrease = BombIncrease.FRAMES_PER_BOMB_INCREASE ;
     
     return this ;
    } ;

BombIncrease.prototype.timeCycle = function()
    {
     if( this.framesTillNextBombIncrease-- <= 0 ) 
        {
         this.framesTillNextBombIncrease = BombIncrease.FRAMES_PER_BOMB_INCREASE ;
         var location = this.map.startingLocation() ;
         this.moveTo( location.x, location.y ) ;
        }
    
    } ;


function ExplosionBlock() {}

ExplosionBlock.prototype = new MapObject() ;

ExplosionBlock.prototype.init = function( map, x, y, color )
    {
     MapObject.prototype.init.call( this, map, x, y ) ;
     
     this.type.unshift( 'ExplosionBlock' ) ;
     
     this.color = color ;
     
     console.log( 'explosion block color ' + color ) ;
     
     console.log( 'content on tile ' + x + ' ' + y + ' = ' + map.tileTable[ x ][ y ].type[ 0 ] + ' with color ' + map.tileTable[ x ][ y ].color ) ;
     
     return this ;
    } ;




function Bomberman() {}

Bomberman.prototype = new MapObject() ;

Bomberman.prototype.init = function( onKill, map, bombCount, blastRange, color )
    {
     var startingLocation = map.startingLocation() ;

     MapObject.prototype.init.call( this, map, startingLocation.x, startingLocation.y ) ;
     
     this.onKill = onKill ;
     
     this.type.unshift( 'Bomberman' ) ;
     
     this.bombCount = bombCount ;
     
     this.blastRange = blastRange ;
          
     this.vx = 0 ;
     
     this.vy = 0 ;
     
     
     this.color = color ;
     
     return this ;
    } ;


Bomberman.prototype.timeCycle = function( screen )
    {
     var nextX = this.x + this.vx ;
     var nextY = this.y + this.vy ;    
     
     if( nextX < 0 || nextX >= this.map.width || nextY < 0 || nextY >= this.map.height )
        return ;
     
     if( this.map.tileTable[ nextX ][ nextY ] != null )
        {
         switch( this.map.tileTable[ nextX][ nextY ].type[ 0 ] )
                {
                 case 'ExplosionBlock' :
        
                    this.onKill() ;
        
                 case 'BombIncrease' :
                 
                    this.bombCount++ ; this.moveTo( nextX, nextY ) ; break ;
                 
                 case 'BlastIncrease' :
                 
                    this.blastRange++ ; this.moveTo( nextX, nextY ) ; break ;
                 
                 default :
                 
                    // there is either a weak block, a solid block, or another bomberman
                    // so movement should be stopped
                 
                    return ;
                }
        }
      else  this.moveTo( nextX, nextY ) ;


    } ;
    
    
Bomberman.prototype.dropBomb = function()
    {
     if( this.map.tileTable[ this.x ][ this.y ].type[ 0 ] != 'Bomb' && this.bombCount > 0  )
        {
         ( new Bomb() ).init( this ) ;
         this.bombCount-- ;
        }
    } ;


Bomb.FRAMES_TILL_DETONATION = 8 ;

function Bomb() {}

Bomb.prototype = new MapObject() ;

Bomb.prototype.init = function( owner )
    {
     MapObject.prototype.init.call( this, owner.map, owner.x, owner.y ) ;
    
     this.type.unshift( 'Bomb' ) ;
     this.framesTillDetonation = Bomb.FRAMES_TILL_DETONATION ;
     this.owner = owner ;
    
     this.color = [ 1, 0, 1 ] ;
     
     console.log( this ) ;
     
     game.timeQueue.push( this ) ;
    } ;

Bomb.prototype.timeCycle = function( screen )
    {
     if( this.framesTillDetonation-- <= 0 ) 
        {
         this.detonate() ;
        }
    } ;

Bomb.prototype.detonate = function()
    {
     this.owner.bombCount++ ;
    
     game.timeQueue.splice( game.timeQueue.indexOf( this ), 1 ) ;
    
     this.destroy() ;
    
     ( new Explosion() ).init( this.map, this.x, this.y, this.owner.blastRange ) ;       
    } ;

Explosion.DURATION_EXPLOSION = 4 ;


function Explosion() {}


Explosion.prototype.init = function( map, x, y, size )
    {    
     this.explosionBlockSet = [ ( new ExplosionBlock() ).init( map, x, y, [ 1, 1, 0 ] ) ] ;
     
     this.duration = Explosion.DURATION_EXPLOSION  ;
     
     var bX ; var bY ; 
     
     var leftIsBlocked = false ;
     var rightIsBlocked = false ;
     var upIsBlocked = false ;
     var downIsBlocked = false ;

     for( var i = 0 ; i < size ; i++ )
        {
         var color = [ 1, 1 - ( (i + 1 ) / size ), 0 ] ;
        
         console.log( color ) ;
        
         bX = x + 1 + i ;
         if( !rightIsBlocked ) rightIsBlocked = this.placeExplosionBlockAndReturnIfBlocked( map, bX, y, color ) ;
            
         bX = x - 1 - i ;
         if( !leftIsBlocked ) leftIsBlocked = this.placeExplosionBlockAndReturnIfBlocked( map, bX, y, color ) ;
         
         bY = y + 1 + i ;
         if( !upIsBlocked ) upIsBlocked = this.placeExplosionBlockAndReturnIfBlocked( map, x, bY, color ) ;
                     
         bY = y - 1 - i ;
         if( !downIsBlocked ) downIsBlocked = this.placeExplosionBlockAndReturnIfBlocked( map, x, bY, color ) ;
        }
    
     game.timeQueue.push( this ) ;
    } ;

Explosion.prototype.placeExplosionBlockAndReturnIfBlocked = function( map, x, y, color )
    {
     console.log( 'placeExplosionBlock' ) ;
    
     if( x >= map.width || x < 0 || y >= map.height || y < 0 ) return true ;
    
     if( map.tileTable[ x ][ y ] == null ) 
        {
         this.explosionBlockSet.push( ( new ExplosionBlock() ).init( map, x, y, color ) ) ;
         return false ;
        }

     switch( map.tileTable[ x ][ y ].type[ 0 ] )
        {
         case 'SolidBlock' : 
            return true ;
         case 'WeakBlock' :
            this.explosionBlockSet.push( ( new ExplosionBlock() ).init( map, x, y, color ) ) ;
            return true ;
         case 'Bomb' :
            map.tileTable[ x ][ y ].detonate() ;             
            return false ;
         case 'Bomberman' :
            map.tileTable[ x ][ y ].onKill() ;
            this.explosionBlockSet.push( ( new ExplosionBlock() ).init( map, x, y, color ) ) ;            
            return false ;
         default:
            this.explosionBlockSet.push( ( new ExplosionBlock() ).init( map, x, y, color ) ) ;
            return false ;
        }    
    } ;


Explosion.prototype.timeCycle = function( screen )
    {
     if( this.duration-- > 0 ) 
        {
         console.log( 'destroying explosion' ) ;
        
         console.log( 'EXPLOSION BLOCK SET SIZE : ' + this.explosionBlockSet.length ) ;
        
         for( var i in this.explosionBlockSet ) this.explosionBlockSet[ i ].destroy() ;
         
         game.timeQueue.splice( game.timeQueue.indexOf( this ), 1 ) ;

        }
        
    } ;


function Game() {}

Game.STARTING_LENGTH = 3 ;

Game.prototype = new GameServerAPI() ;


Game.prototype.start = function( width, height ) 
    {
     this.map = ( new Map() ).init( width, height ) ;
     
     for( var x = 1 ; x < this.map.width  ; x+=2 )
     for( var y = 1 ; y < this.map.height ; y+=2 )
        {
         if( x == 7 ) x = 6 ; 
         if( y == 5 ) y = 6     ;          
         ( new SolidBlock() ).init( this.map, x, y, [1,1,1] ) ;
        }
        
     for( var i = 20 ; i > 0 ; i-- ) 
        {
         var l = this.map.startingLocation() ;
         
         ( new WeakBlock() ).init( this.map, l.x, l.y, [0,0,.6] ) ;         
        } ;


     this.bombermanSet = {} ;
     
     this.timeQueue = [] ;
     
     ( new BlastIncrease() ).init( this.map ) ;

     ( new BombIncrease() ).init( this.map ) ;

    } ;


Game.prototype.timeCycle = function( screen )
    {
     console.log( 'start time cycle' ) ;
     screen.clear() ;
    
     for( var i in this.bombermanSet )
        {
         this.bombermanSet[ i ].timeCycle( screen ) ;
        }
        
     var timeQueueTasks = [] ;
     
     for( var i in this.timeQueue )  timeQueueTasks.push( this.timeQueue[ i ] ) ; // if you process the time queue directly you can't remove element from that queue while you are iterating the elements
     for( var i in timeQueueTasks ) timeQueueTasks[ i ].timeCycle( screen ) ;
        
     for( var x = 0 ; x < screen.width  ; x++ )
     for( var y = 0 ; y < screen.height ; y++ )
        {
         var mapObject = this.map.tileTable[ x ][ y ] ;
         var color = [ 0, 0, 0 ] ;
         if( mapObject != null ) color = mapObject.color ;
         
         screen.setColor( x, y, color ) ;
        }
        
     console.log( 'end time cycle' ) ;
    } ;


Game.prototype.stop = function( data )
    {
     
    } ;

Game.prototype.introducePlayer = function( playerId )
    {
     console.log( 'INTRODUCE PLAYER ' + playerId ) ;
    
     var self = this ;
    
     this.bombermanSet[ playerId ] = ( new Bomberman() ).init( 
        function() { self.removePlayer( playerId ) ; self.killPlayer( playerId ) ; },
        this.map, 3, 3, [ Math.random(), Math.random(), Math.random() ] ) ;
    } ;


Game.prototype.removePlayer = function( playerId )
    {
     if( !this.bombermanSet[ playerId ] ) return ;
    
     this.bombermanSet[ playerId ].destroy() ;
    
     delete this.bombermanSet[ playerId ] ;
    } ;
    
Game.prototype.playerCommand = function( command )
    {
     // console.log( command ) ;
    
     var player = this.bombermanSet[command.playerId];
          
     if( !player ) { console.log( 'NO PLAYER' ) ; return ; }
     
     if( command.event == 'down' )
        {
         switch( command.button )
            {
             case 'up':      player.vy = -1 ; player.vx =  0 ; break ;
             case 'down':    player.vy =  1 ; player.vx =  0 ; break ;  
             case 'left':    player.vx = -1 ; player.vy =  0 ; break ;
             case 'right':   player.vx =  1 ; player.vy =  0 ; break ;
             case 'a':       player.dropBomb() ; break ;
            }
        }
        
     if( command.event == 'up' )
        {
         switch( command.button )
            {
             case 'up':      { if( player.vy ==  1 ) player.vy =  0 ; } break ;
             case 'down':    { if( player.vy == -1 ) player.vy =  0 ; } break ;  
             case 'left':    { if( player.vx == -1 ) player.vx =  0 ; } break ;
             case 'right':   { if( player.vx ==  1 ) player.vx =  0 ; } break ;
            }
        }

    } ;

game = ( new Game() ).init( 8989 ) ;






