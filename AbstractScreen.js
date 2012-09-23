function AbstractScreen() {};

AbstractScreen.prototype.init = function(width, height) {
    this.width = width;
    this.height = height;

    this.pixelMap = new Array(width);
    for (var x = 0; x < width; x++) {
        this.pixelMap[x] = [];
        for (var y = 0; y < height; y++) {
            this.setColor(x, y, [0, 0, 0]);
        }
    }
    return this;
};

AbstractScreen.prototype.setColor = function(x, y, color) {
    this.pixelMap[x][y] = color;
};


AbstractScreen.prototype.toObject = function() {
    return this.pixelMap;
};


AbstractScreen.prototype.fromObject = function(abstractScreenAsObject) {
    for (var x = 0; x < abstractScreenAsObject.length; x++)
    for (var y = 0; y < abstractScreenAsObject[0].length; y++) {
        this.setColor(x, y, abstractScreenAsObject[x][y]);
    }
};


AbstractScreen.prototype.clear = function()
    {
     for (var x = 0; x < this.pixelMap.length; x++)
     for (var y = 0; y < this.pixelMap[0].length; y++) 
        this.setColor(x, y, [ 0, 0, 0 ]);
    
    } ;

module.exports = AbstractScreen;