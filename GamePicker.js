var fs = require("fs");
var GameExecuter = require("./GameExecuter");

function GamePicker() {};


GamePicker.prototype.init = function(screen, sockets, server, playerQueueManagement) {
    console.log('init game picker');
    var self = this;

    this.screen = screen;

    // this.gameInfoSet = fs.readdirSync( './games' ) ;

    this.loadGames();

    // this.selectedGameInfoIndex = 0 ;

    // this.selectGameInfo( 0 ) ;

    this.sockets = sockets;

    this.boundListenToSocketForNavigation       = function( socket ) { self.listenToSocketForNavigation( socket ) }  ;
    this.boundListenToAllClientsForNavigation   = function( socket ) { self.listenToAllClientsForNavigation( socket ) } ;

    this.listenToAllClientsForNavigation();
    
      
    this.server = server;
    this.playerQueueManagement = playerQueueManagement;
    return this;
};

GamePicker.prototype.loadGames = function() {
    this.gameInfoSet = fs.readdirSync('./games').filter(function (name) {
        return name[0]!='.';
    });

    if (!this.playingGame) this.selectGameInfo(!isNaN(this.selectedGameInfoIndex) ? this.selectedGameInfoIndex : 0);
}


GamePicker.prototype.listenToAllClientsForNavigation = function() {
    var self = this;

    var clients = this.sockets.clients();
    for (var i in clients) {
        clients[i].removeAllListeners();

        this.listenToSocketForNavigation(clients[i]);
    }

    if( this.boundListenToAllClientsForGameExit )
        this.sockets.removeListener('connection', this.boundListenToAllClientsForGameExit );

    this.sockets.on( 'connection', this.boundListenToSocketForNavigation ) ;

    // this.sockets.on('connection', function(socket) {
    //    self.listenToSocketForNavigation(socket);
    // });

};



GamePicker.prototype.listenToAllClientsForGameExit = function() {
    var self = this;

    var clients = this.sockets.clients();
    for (var i in clients) {
        clients[i].removeAllListeners();

        this.listenToSocketForGameExit(clients[i]);
    }

    if( this.boundListenToSocketForNavigation )
        this.sockets.removeListener('connection', this.boundListenToSocketForNavigation);

    this.sockets.on('connection', function(socket) {
        self.listenToSocketForGameExit(socket);
    });

};


GamePicker.prototype.listenToSocketForNavigation = function(socket) {
    var self = this;

    socket.on('controllerLeft', function(data) {
        if (data == 'down') self.selectGameInfo(self.selectedGameInfoIndex - 1);
    });

    socket.on('controllerRight', function(data) {
        if (data == 'down') self.selectGameInfo(self.selectedGameInfoIndex + 1);
    });

    socket.on('controllerA', function(data) {
        if (data == 'down') {
            self.listenToAllClientsForGameExit();

            self.isPlayingGame = true;
            self.currentGameExecuter = (new GameExecuter()).init(self.screen, self.selectedGameInfo, self.sockets, self.server, self.playerQueueManagement);
        }
    });

};


GamePicker.prototype.listenToSocketForGameExit = function(socket) {
    var self = this;

    socket.on('controllerSelect', function(data) {
        if (data == 'down') {


            self.currentGameExecuter.stopRequest(function() {
                console.log("STOP REQUEST INVOKED");
                self.isPlayingGame = true;

                var screenshot = self.screen.toObject();

                self.selectedGameInfo.image = screenshot;

                fs.writeFileSync('./games/' + self.gameInfoSet[self.selectedGameInfoIndex], JSON.stringify(self.selectedGameInfo));


                self.listenToAllClientsForNavigation();

                // self.selectGameInfo( self.selectedGameInfoIndex ) ;
                self.loadGames();
            });


            console.log('STOPPING CURRENT GAME');
        }
    });

};



GamePicker.prototype.removeNavigationListeners = function() {
    var clients = this.sockets.clients();

    for (var i in clients) {
        clients[i].removeAllListeners('controllerUp');
        clients[i].removeAllListeners('controllerDown');
        clients[i].removeAllListeners('controllerLeft');
        clients[i].removeAllListeners('controllerRight');

        clients[i].removeAllListeners('controllerA');
        clients[i].removeAllListeners('controllerB');

        clients[i].removeAllListeners('controllerStart');
    }

};





GamePicker.prototype.selectGameInfo = function(index) {
    if (index >= this.gameInfoSet.length) index = 0;
    if (index < 0) index = this.gameInfoSet.length - 1;


    this.selectedGameInfo = JSON.parse(fs.readFileSync('./games/' + this.gameInfoSet[index]));

    console.log( './games/' + this.gameInfoSet[index] ) ;
    console.dir( this.selectedGameInfo ) ;

    if (!this.selectedGameInfo.image) {
        this.selectedGameInfo.image = JSON.parse(fs.readFileSync('./public/img/screenshotUnavailable.asc'));
        fs.writeFileSync('./games/' + this.gameInfoSet[index], JSON.stringify(this.selectedGameInfo));
    }


    this.screen.fromObject(this.selectedGameInfo.image);

    this.selectedGameInfoIndex = index;

};
module.exports = GamePicker;
