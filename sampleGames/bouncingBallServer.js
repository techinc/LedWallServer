// var http = require('http');
var GameAPI = require( '../GameAPI') ;

var screen;


var tail;
var vx;
var vy;
var animationInterval;

function Game() {} ;


Game.prototype = new GameAPI() ;

Game.prototype.start = function( w, h ) {
	width = w;
    height = h;

    tail = [{
        x: 5,
        y: 5,
        color: [1, 1, 1]
    }, {
        x: 5,
        y: 5,
        color: [1, 1, .5]
    }, {
        x: 5,
        y: 5,
        color: [.9, .9, .3]
    }, {
        x: 5,
        y: 5,
        color: [.7, .6, .1]
    }, {
        x: 5,
        y: 5,
        color: [.6, .4, 0]
    }, {
        x: 5,
        y: 5,
        color: [.5, .2, 0]
    }, {
        x: 5,
        y: 5,
        color: [.2, .1, 0]
    }, {
        x: 5,
        y: 5,
        color: [.17, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.13, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.09, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.07, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.06, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.04, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.02, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [.01, 0, 0]
    }, {
        x: 5,
        y: 5,
        color: [0, 0, 0]
    }];

    vx = 1;
    vy = 1;

    clearScreen();

    if (animationInterval) clearInterval(animationInterval);
    
	animationInterval = setInterval( updateTail, 50 ) ;
} ;

Game.prototype.stop = function() { clearInterval(animationInterval); } ;

var game = ( new Game() ).init( 6000, require('../SocketMessenger'), require('../JSONCodec')) ; 




function clearScreen() {
    for (var x = 0; x < game.screen.width; x++)
    for (var y = 0; y < game.screen.height; y++) {
        game.screen.setColor(x, y, [0, 0, 0]);
    };
};


function shiftTail() {
    for (var i = tail.length - 1; i > 0; i--) {
        tail[i].x = tail[i - 1].x;
        tail[i].y = tail[i - 1].y;
    }
}

function drawTail() {
    console.log('drawTail ' + tail.length);
   
      for( var i = tail.length - 1 ; i != 0 ; i-- )
		{
		 console.log( 'i ' + i ) ;
		 console.log( 'set color tail : ' + tail[i].x + ' ' + tail[i].y + ' ' + tail[i].color) ;
         game.screen.setColor(tail[i].x, tail[i].y, tail[i].color);  
		}
    
}

function updateTail() {
    shiftTail();

    if ((tail[0].x + vx >= game.screen.width) || (tail[0].x + vx < 0)) vx = -vx;
    if ((tail[0].y + vy >= game.screen.height) || (tail[0].y + vy < 0)) vy = -vy;

    tail[0].x += vx;
    tail[0].y += vy;


    drawTail();

	game.sendFrame() ;
};