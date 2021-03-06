var AbstractScreen = require('../AbstractScreen');
/*
var http = require('http');
var querystring = require('querystring');
*/
var GameAPI = require('../GameAPI') ;

var COLOR_SPEED = 200 / 255;
var MOVE_SPEED = 800 / 255;

var FRAME_DURATION = 50;


var screen = "uninitialized" ;

var playerSet;

var drawingOn = false ;


function Game() {} ;

Game.prototype = new GameAPI() ;

Game.prototype.start = function( width, height ) {
	var self = this ;
	clearScreen();

	screen = ( new AbstractScreen() ).init( width, height ) ;
    playerSet = {};

	this.timeCycleInterval = setInterval( function() {

	    self.screen.fromObject(JSON.parse(JSON.stringify(screen.toObject() )));

	    for (var i in playerSet) {
	        var p = playerSet[i];

	        self.screen.setColor(Math.floor(p.x), Math.floor(p.y), [p.red, p.green, p.blue]);
     	}
	    
		self.sendFrame() ;
	}, 50) ;
} ;

Game.prototype.stop = function()
{
	clearInterval( this.timeCycleInterval ) ;
}

Game.prototype.introducePlayer = function( playerId ) {

    playerSet[playerId] = (new MultiDrawer()).init();
}


Game.prototype.removePlayer = function( playerId ) {
	
	playerSet[playerId].stopAllIntervals();

    delete playerSet[playerId];
}


Game.prototype.playerCommand = function( command ) {
	
    var player = playerSet[command.playerId];
    
    if( !player ) { res.end() ; return ; }

    if( drawingOn ) player.putPixel() ;

    if (command.button == 'start' && command.event == 'down') {
        
        this.killPlayer( command.playerId ) ;

        delete playerSet[command.playerId] ;

		return ;
	} else if (player.mode == "move") switch (command.button) {
    case 'up':
        if (command.event == "down") player.moveVertical(1);
        else if (command.event == "up") player.stopMoveVertical();
        break;
    case 'down':
        if (command.event == "down") player.moveVertical(-1);
        else if (command.event == "up") player.stopMoveVertical();
        break;
    case 'left':
        if (command.event == "down") player.moveHorizontal(-1);
        else if (command.event == "up") player.stopMoveHorizontal();
        break;
    case 'right':
        if (command.event == "down") player.moveHorizontal(1);
        else if (command.event == "up") player.stopMoveHorizontal();
        break;
    case 'b':
        if (command.event == "down") drawingOn = true ;
        else drawingOn = false ;
        
        if( drawingOn ) player.putPixel() ;
        break;

    case 'y':
        if (command.event == "down") player.mode = "green";
        break;

    case 'x':
        if (command.event == "down") player.mode = "blue";
        break;

    case 'a':
        if (command.event == "down") player.mode = "red";
        break;
    } else if (player.mode == "red") switch (command.button) {
    case 'up':
        if (command.event == "down") player.growRed();
        else if (command.event == "up") player.stopRed();
        break;
    case 'down':
        if (command.event == "down") player.shrinkRed();
        else if (command.event == "up") player.stopRed();
        break;
    case 'left':
        if (command.event == "down") player.shrinkRed();
        else if (command.event == "up") player.stopRed();
        break;
    case 'right':
        if (command.event == "down") player.growRed();
        else if (command.event == "up") player.stopRed();
        break;

    case 'a':
        if (command.event == "up") player.mode = "move";
        break;
    } else if (player.mode == "green") switch (command.button) {
    case 'up':
        if (command.event == "down") player.growGreen();
        else if (command.event == "up") player.stopGreen();
        break;
    case 'down':
        if (command.event == "down") player.shrinkGreen();
        else if (command.event == "up") player.stopGreen();
        break;
    case 'left':
        if (command.event == "down") player.shrinkGreen();
        else if (command.event == "up") player.stopGreen();
        break;
    case 'right':
        if (command.event == "down") player.growGreen();
        else if (command.event == "up") player.stopGreen();
        break;

    case 'y':
        if (command.event == "up") player.mode = "move";
        break;
    } else if (player.mode == "blue") switch (command.button) {
    case 'up':
        if (command.event == "down") player.growBlue();
        else if (command.event == "up") player.stopBlue();
        break;
    case 'down':
        if (command.event == "down") player.shrinkBlue();
        else if (command.event == "up") player.stopBlue();
        break;
    case 'left':
        if (command.event == "down") player.shrinkBlue();
        else if (command.event == "up") player.stopBlue();
        break;
    case 'right':
        if (command.event == "down") player.growBlue();
        else if (command.event == "up") player.stopBlue();
        break;

    case 'x':
        if (command.event == "up") player.mode = "move";
        break;
    }
} ;

var game = ( new Game() ).init( 6969, require( '../SocketMessenger'), require( '../JSONCodec') ) ;

function MultiDrawer() {};

MultiDrawer.prototype.init = function() {
    this.x = Math.floor(screen.width / 2);
    this.y = Math.floor(screen.height / 2);

    this.red = Math.random();
    this.green = Math.random();
    this.blue = Math.random();

    this.xInterval = false;
    this.yInterval = false;

    this.redInterval = false;
    this.greenInterval = false;
    this.blueInterval = false;

    this.moveHorizontalInterval = false;
    this.moveVerticalInterval = false;
    
    this.mode = "move" ;

    return this ;
};

MultiDrawer.prototype.putPixel = function() {
    screen.setColor(Math.floor(this.x), Math.floor(this.y), [this.red, this.green, this.blue]);
};


MultiDrawer.prototype.increaseColorComponent = function(colorComponent) {
    return (colorComponent + COLOR_SPEED * FRAME_DURATION / 1000) % 1;
};

MultiDrawer.prototype.decreaseColorComponent = function(colorComponent) {
    colorComponent -= COLOR_SPEED * FRAME_DURATION / 1000;
    return colorComponent < 0 ? colorComponent % 1 + 1 : colorComponent;
}


MultiDrawer.prototype.moveHorizontal = function(direction) {
    var self = this;
    this.stopMoveHorizontal();

    this.moveHorizontalInterval = setInterval(function() {
        self.x += direction * MOVE_SPEED * FRAME_DURATION / 1000;


        while (self.x < 0) self.x += screen.width;
        while (self.x >= screen.width) self.x -= screen.width;

    }, FRAME_DURATION);
}

MultiDrawer.prototype.stopMoveHorizontal = function() {
    if (this.moveHorizontalInterval) clearInterval(this.moveHorizontalInterval);
};




MultiDrawer.prototype.moveVertical = function(direction) {
    var self = this;

    this.stopMoveVertical();

    this.moveVerticalInterval = setInterval(function() {
        self.y += direction * MOVE_SPEED * FRAME_DURATION / 1000;


        while (self.y < 0) self.y += screen.width;
        while (self.y >= screen.width) self.y -= screen.width;

    }, FRAME_DURATION);
}

MultiDrawer.prototype.stopMoveVertical = function() {
    if (this.moveVerticalInterval) clearInterval(this.moveVerticalInterval);
}



MultiDrawer.prototype.growRed = function() {
    var self = this;

    if (this.redInterval) clearInterval(this.redInterval);

    this.redInterval = setInterval(

    function() {
        self.red = self.increaseColorComponent(self.red);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.shrinkRed = function() {
    var self = this;

    if (this.redInterval) clearInterval(this.redInterval);

    this.redInterval = setInterval(

    function() {
        self.red = self.decreaseColorComponent(self.red);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.stopRed = function() {
    if (this.redInterval) clearInterval(this.redInterval);
}






MultiDrawer.prototype.growGreen = function() {
    var self = this;

    if (this.greenInterval) clearInterval(this.greenInterval);

    this.greenInterval = setInterval(

    function() {
        self.green = self.increaseColorComponent(self.green);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.shrinkGreen = function() {
    var self = this;

    if (this.greenInterval) clearInterval(this.greenInterval);

    this.greenInterval = setInterval(

    function() {
        self.green = self.decreaseColorComponent(self.green);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.stopGreen = function() {
    if (this.greenInterval) clearInterval(this.greenInterval);
}






MultiDrawer.prototype.growBlue = function() {
    var self = this;

    if (this.blueInterval) clearInterval(this.blueInterval);

    this.blueInterval = setInterval(

    function() {
        self.blue = self.increaseColorComponent(self.blue);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.shrinkBlue = function() {
    var self = this;

    if (this.blueInterval) clearInterval(this.blueInterval);

    this.blueInterval = setInterval(

    function() {
        self.blue = self.decreaseColorComponent(self.blue);
    }, FRAME_DURATION);

}

MultiDrawer.prototype.stopBlue = function() {
    if (this.blueInterval) clearInterval(this.blueInterval);
}


MultiDrawer.prototype.stopAllIntervals = function() {
    this.stopMoveHorizontal();
    this.stopMoveVertical();

    this.stopRed();
    this.stopGreen();
    this.stopBlue();

};


function clearScreen() {
    for (var x = 0; x < screen.width; x++)
    for (var y = 0; y < screen.height; y++) {
        screen.setColor(x, y, [0.1, 0.1, 0.4]);
    };
};

