var AbstractScreen = require("./AbstractScreen");
//var serial = require("serialport")
var net = require("net")

    function SocketClientScreen() {};

SocketClientScreen.prototype = new AbstractScreen();

SocketClientScreen.prototype.init = function(port, address, width, height) {

    this.sentMessageCount = 0;

    this.client = new net.Socket();
    this.client.connect(port, address, function() {
    //this.client.connect(8000, '10.68.0.139', function() {
        console.log('Connected!');
        });

    this.sendQueue = [];

    AbstractScreen.prototype.init.call(this, width, height);

    return this;
};


SocketClientScreen.prototype._sendNext = function() {
    while (this.messageInTransitCount < 10) {
        if (this.sendQueue.length == 0) return;

        this.messageInTransitCount++;
    }
};


SocketClientScreen.prototype.flushSendQueue = function() {
    this.sentMessageCount = 0;

    while (this.sendQueue.length > 0)

    //this.serial.write(this.sendQueue.shift());
        this.client.write(this.sendQueue.shift());
};

SocketClientScreen.prototype.fromObject = function(abstractScreenAsObject) {

	var i=0;
	var buf = new Buffer(360);
	
    for (var y = 0; y < abstractScreenAsObject[0].length; y++)
        for (var x = 0; x < abstractScreenAsObject.length; x++)
        	for (var c = 0; c < 3; c++)
			{
				this.pixelMap[x][y][c] = abstractScreenAsObject[x][y][c];
			
				var v = abstractScreenAsObject[x][y][c];
				if (v < 0)
					v = 0;
				if (v > 1)
	                v = 1;
				buf.writeUInt8(Math.floor(v*255), i)
				i++;
			}
        this.client.write(buf);
        this.flushSendQueue();
};

module.exports = SocketClientScreen;