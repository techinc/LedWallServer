var AbstractScreen = require('./AbstractScreen');
var http = require('http');


var screen;


var tail;
var vx;
var vy;
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

            res.end();
        });
    } else if (req.url == '/timeCycle') {
        console.log('timeCycle');
        updateTail();
        res.end(JSON.stringify({
            type: "bitmap",
            content: screen.toObject()
        }));
    } else if (req.url == '/stop') {
        clearInterval(animationInterval);
        console.log('STOP');
        res.end();
    }



}).listen(6000, 'localhost');






function clearScreen() {
    for (var x = 0; x < width; x++)
    for (var y = 0; y < height; y++) {
        screen.setColor(x, y, [0, 0, 0]);
    };
};


function shiftTail() {
    for (var i = tail.length - 1; i > 0; i--) {
        tail[i].x = tail[i - 1].x;
        tail[i].y = tail[i - 1].y;
    }
}

function drawTail() {
    console.log('drawTail');
    // for (var i = 0; i < tail.length; i++) {
    //    screen.setColor(tail[i].x, tail[i].y, tail[i].color);
        
      for( var i = tail.length - 1 ; i == 0 ; i++ )
          screen.setColor(tail[i].x, tail[i].y, tail[i].color);  
    }
}

function updateTail() {
    shiftTail();

    if ((tail[0].x + vx >= screen.width) || (tail[0].x + vx < 0)) vx = -vx;
    if ((tail[0].y + vy >= screen.height) || (tail[0].y + vy < 0)) vy = -vy;

    tail[0].x += vx;
    tail[0].y += vy;


    drawTail();
};