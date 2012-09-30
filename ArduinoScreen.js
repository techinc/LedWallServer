var AbstractScreen = require("./AbstractScreen");
var serial = require("serialport")

function ArduinoScreen() {};

ArduinoScreen.MESSAGE_LIMIT = 10 ;


ArduinoScreen.prototype = new AbstractScreen();

ArduinoScreen.prototype.init = function(serialString, width, height) {

    this.sentMessageCount = 0;

    this.serial = new serial.SerialPort(serialString, {
        baudrate: 115200
    });


    this.sendQueue = []; // the sendQueue stores all putpixelcommands that the arduino can't handle yet
                         // the screen won't send more than ArduinoScreen.MESSAGE_LIMIT  messages.


    var self = this;
    this.serial.on('data', function(data) { // every time any information is sent from the arduino, the screen knows it is safe to send messages again
        this.sentMessageCount = 0;

        self.flushSendQueue();
    });

    AbstractScreen.prototype.init.call(this, width, height);

    return this;
};

// is this function actually called? :
ArduinoScreen.prototype._sendNext = function() {
    while (this.messageInTransitCount < ArduinoScreen.MESSAGE_LIMIT) {
        if (this.sendQueue.length == 0) return; 

        var message = this.sendQueue.shift(); // get the next message

        this.serial.write(message); // send it
        this.messageInTransitCount++; // note that another message is in transit
    }
};


ArduinoScreen.prototype.send = function(message) {
    this.sendQueue.push(message); // push the message on the send queue

    this.sentMessageCount++; // increase the sent message count
    if (this.sentMessageCount <= ArduinoScreen.MESSAGE_LIMIT) { // while the message count has not been exceeded, keep sending messages
        this.flushSendQueue();
    }
};


ArduinoScreen.prototype.flushSendQueue = function() {
    this.sentMessageCount = 0; // this line is probably a bug. I think it should be removed, because it prevents the sentMessageCount from increasing

    while (this.sendQueue.length > 0) // if there are messages to be sent, send all messages
        this.serial.write(this.sendQueue.shift());
};


ArduinoScreen.prototype.setColor = function(x, y, color) {
    AbstractScreen.prototype.setColor.call(this, x, y, color); // by calling this parent method, the screen knows what pixels are set to what colors


     x = this.width - 1 - x ; // we have to flip the x coordinate to put the top left corner on the other side of the screen

    // the screen is a sequence of led modules that snakes up and down the columns of the screen from left o right (when viewed inside)
    // it snakes from right to left when viewed outside
    // it starts at the right bottom corner (viewed from outside), moves up a column, then moves to the left a row, and moves down a column,
    // then moves left a row, and moves up again, thus covering the whole screen.
    
    // so the first this.height nodes are in the first column, the second this.height nodes are in the second column, the third height columns 
    // are in the third column, etc.
    
    // the row is a bit more tricky though:
    // on the first column (y = 0) the lowest node index (i) corresponds to the highest y coordinate.
    // on the second column (y = 1) the  lowest node index (i) corresponds to the lowest y coordinate.
    // and on the third ( y = 2 ) it is like the first column again.

    var columnStartIndex = x * this.height; // the led nodes of the next column start after the nodes of the previous column
                                            // to find the right column, pass x columns.

    var relativeRowIndex;

    if ((x % 2) == 1) relativeRowIndex = y; // on uneven y coordinates, the relativeRowIndex is equal to the y coordinate
    else relativeRowIndex = this.height - 1 - y; // on uneven coordinates we go backward, i.e. a high y means a low relativeRowIndex,
                                                 // and a low y means a high relativeRowIndex

    var i = columnStartIndex + relativeRowIndex; // the correct i of the led module is now columnStartIndex + relativeRowIndex


    var putPixelCommand = new Buffer(4); // put the command information in a data buffer

    putPixelCommand[0] = i;

    putPixelCommand[1] = Math.floor(250 * color[0]);
    putPixelCommand[2] = Math.floor(250 * color[1]);
    putPixelCommand[3] = Math.floor(250 * color[2]);


    this.send(putPixelCommand); // and make sure it is sent. Note that this call puts the pixelCommand on the send queue, and might not send it immediately
};
module.exports = ArduinoScreen;