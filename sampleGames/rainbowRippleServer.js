var GameAPI = require( '../GameAPI' ) ;

var width;
var height;
var animationInterval;

function Game() {} 

Game.prototype = new GameAPI() ;

Game.prototype.start = function( width, height )
{
	console.log( 'START' ) ;
	
    width = width;
    height = height;

   // screen = (new AbstractScreen()).init(width, height);

    clearScreen();


    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(updateScreen, 50);	
} ;


Game.prototype.stop = function() { clearInterval(animationInterval);} ;

/*
http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    if (req.url == '/init') {
        var responseData = "";

        req.on('data', function(chunk) {
            responseData += chunk;
        });

        req.on('end', function() {

            var initObj = JSON.parse(responseData);

            console.log(initObj);

            width = initObj.width;
            height = initObj.height;

            screen = (new AbstractScreen()).init(width, height);

            console.log(screen);

            clearScreen();


            if (animationInterval) clearInterval(animationInterval);

            animationInterval = setInterval(updateScreen, initObj.fps);

            res.end();
        });
    } else if (req.url == '/timeCycle') {
        console.log('timeCycle');
		console.log( JSON.stringify({
            type: "bitmap",
            content: screen.toObject()
        }) ) ;

        res.end(JSON.stringify({
            type: "bitmap",
            content: screen.toObject()
        }));
    } else if (req.url == '/stop') {
        clearInterval(animationInterval);
        console.log('STOP');
        res.end();
    }



}).listen(4000, 'localhost');
*/

function clearScreen() {
    for (var x = 0; x < width; x++)
    for (var y = 0; y < height; y++) {
        game.screen.setColor(x, y, [0, 0, 0]);
    };
};


function intensity(x, y, t) {
    var rX = 6 - x;
    var rY = 5 - y;

    var distance = Math.sqrt(rX * rX + rY * rY);


    var intensityFactor = Math.sin((distance / 3.5) * Math.PI - t) / 2 + .5;

    return intensityFactor;
}


function updateScreen() {
	
    var periodDuration = 2500;
    var timeScaleFactor = Math.PI * 2 / periodDuration;

    var t = (new Date()).getTime() * timeScaleFactor; // / 200 ;

    for (var x = 0; x < game.screen.width; x++)
    for (var y = 0; y < game.screen.height; y++) {
        game.screen.setColor(x, y, [Math.pow(intensity(x, y, t), 3), Math.pow(intensity(x, y, t + Math.PI * 2 / 3), 3), Math.pow(intensity(x, y, t + 2 * Math.PI * 2 / 3), 3)]);
    };

	game.sendFrame() ;
};
game = ( new Game() ).init( 4000, require( '../SocketMessenger'), require( '../JSONCodec') ) ;
