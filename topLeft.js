var AbstractScreen = require('./AbstractScreen');
var http = require('http');


var screen;
var y;
var animationInterval;


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

            y = 0;
            clearScreen();

            if (animationInterval) clearInterval(animationInterval);

            res.end();
        });
    } else if (req.url == '/timeCycle') {
        console.log('timeCycle');

        screen.setColor( 0, 0, [ 1, 0, 0 ] ) ;
        res.end(JSON.stringify({
            type: "bitmap",
            content: screen.toObject()
        }));
    } else if (req.url == '/stop') {
        clearInterval(animationInterval);
        console.log('STOP');
        res.end();
    }



}).listen(2500, 'localhost');






function clearScreen() {
    for (var x = 0; x < width; x++)
    for (var y = 0; y < height; y++) {
        screen.setColor(x, y, [0, 0, 0]);
    };
};
