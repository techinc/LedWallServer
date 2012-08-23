var AbstractScreen = require('./AbstractScreen');
var http = require('http');


var screen;
var width;
var height;
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

            console.log(screen);

            clearScreen();


            if (animationInterval) clearInterval(animationInterval);

            animationInterval = setInterval(updateScreen, initObj.fps);

            res.end();
        });
    } else if (req.url == '/timeCycle') {
        console.log('timeCycle');
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






function clearScreen() {
    for (var x = 0; x < width; x++)
    for (var y = 0; y < height; y++) {
        screen.setColor(x, y, [0, 0, 0]);
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


    for (var x = 0; x < width; x++)
    for (var y = 0; y < height; y++) {


        screen.setColor(x, y, [Math.pow(intensity(x, y, t), 3), Math.pow(intensity(x, y, t + Math.PI * 2 / 3), 3), Math.pow(intensity(x, y, t + 2 * Math.PI * 2 / 3), 3)]);
    };
};