var ArduinoScreen = require('./ArduinoScreen');
var GameExecuter = require('./GameExecuter');


var screen = (new ArduinoScreen()).init('/dev/tty.usbmodem1a21', 12, 10);

var gameExecuter = (new GameExecuter()).init(screen, {
    host: 'localhost',
    port: '4000'
});