var fs = require("fs");
var GameExecuter = require("./GameExecuter");

function GamePicker() {};


GamePicker.prototype.init = function(screen, sockets, server, playerQueueManagement) {

    var self = this;

    this.screen = screen;

    this.loadGames(); // load the games in the game dir

    this.sockets = sockets;

    // this is just to make it easier to pass them as callback functions
    this.boundListenToSocketForNavigation       = function( socket ) { self.listenToSocketForNavigation( socket ) }  ;
    this.boundListenToAllClientsForNavigation   = function( socket ) { self.listenToAllClientsForNavigation( socket ) } ;

    this.listenToAllClientsForNavigation(); // when the GamePicker is started, it runs the menu, so controllers should navigate the menu
    
      
    this.server = server;
    this.playerQueueManagement = playerQueueManagement;
    return this;
};

GamePicker.prototype.loadGames = function() {
    this.gameInfoSet = fs.readdirSync('./games').filter(function (name) { // load all games, that are contained in files that do not start with a '.' in their name
        return name[0]!='.';
    });

    // the following line takes into account that a new game might be added to the menu while GamePicker is running
    // if no games are played select a game. When selecting this game, if no game is currently selected, select game 0, otherwise reselect the current game.
    if (!this.playingGame) this.selectGameInfo(!isNaN(this.selectedGameInfoIndex) ? this.selectedGameInfoIndex : 0); 
}


GamePicker.prototype.listenToAllClientsForNavigation = function() {
    var self = this;

    var clients = this.sockets.clients();
    for (var i in clients) {
        clients[i].removeAllListeners();

        this.listenToSocketForNavigation(clients[i]); // all current players should be able to navigate the menu
    }

    if( this.boundListenToAllClientsForGameExit ) // 
        this.sockets.removeListener('connection', this.boundListenToAllClientsForGameExit ); // the select button on controllers of connecting players should no longer mean "exit game" either

    this.sockets.on( 'connection', this.boundListenToSocketForNavigation ) ; // any connecting player should be given control to navigate too
};



GamePicker.prototype.listenToAllClientsForGameExit = function() {
    var self = this;

    var clients = this.sockets.clients();
    for (var i in clients) {
        clients[i].removeAllListeners(); 

        this.listenToSocketForGameExit(clients[i]); // all current players should be able to quit the game by pressing select
    }

    if( this.boundListenToSocketForNavigation )
        this.sockets.removeListener('connection', this.boundListenToSocketForNavigation);  // the buttons on controllers of connecting players should no longer navigate the menu

    this.sockets.on('connection', function(socket) {
        self.listenToSocketForGameExit(socket); // any connecting player should be able to quit the game by pressing select
    });

};


GamePicker.prototype.listenToSocketForNavigation = function(socket) {
    var self = this;

    // left and right move through the games in the menu

    socket.on('controllerLeft', function(data) {
        if (data == 'down') self.selectGameInfo(self.selectedGameInfoIndex - 1);
    });

    socket.on('controllerRight', function(data) {
        if (data == 'down') self.selectGameInfo(self.selectedGameInfoIndex + 1);
    });


    // "a" executes a game

    socket.on('controllerA', function(data) {
        if (data == 'down') {
            self.listenToAllClientsForGameExit(); // during a game, select means quit the game. This is dealt with in this.listenToAllClientsForGameExit() ;

            self.isPlayingGame = true; // is this line actually necessary?
            self.currentGameExecuter = (new GameExecuter()).init(self.screen, self.selectedGameInfo, self.sockets, self.server, self.playerQueueManagement);
        }
    });

};


GamePicker.prototype.listenToSocketForGameExit = function(socket) {
    var self = this;

    // if select is pressed, stop the game, go back to the menu and make the controllers navigate the menu rather than control the game

    socket.on('controllerSelect', function(data) {
        if (data == 'down') {


            self.currentGameExecuter.stop(function() {
                console.log("STOP REQUEST INVOKED");
                self.isPlayingGame = true; // is this line actually necessary?

                // update the screenshot of the game
                var screenshot = self.screen.toObject(); 

                self.selectedGameInfo.image = screenshot; 

                fs.writeFileSync('./games/' + self.gameInfoSet[self.selectedGameInfoIndex], JSON.stringify(self.selectedGameInfo));


                // start listening to the controllers for navigation again
                self.listenToAllClientsForNavigation();

                // and load any new games
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

    if (index >= this.gameInfoSet.length) index = 0;    // if trying to select an index larger than the current number games, select the first game
    if (index < 0) index = this.gameInfoSet.length - 1; // if trying to select a game before the first, select the last


    this.selectedGameInfo = JSON.parse(fs.readFileSync('./games/' + this.gameInfoSet[index])); // get info on the selected game

    console.log( './games/' + this.gameInfoSet[index] ) ;

    if (!this.selectedGameInfo.image) { // if the game has no image, give it the place holder image with the question mark
        this.selectedGameInfo.image = JSON.parse(fs.readFileSync('./public/img/screenshotUnavailable.asc'));
        fs.writeFileSync('./games/' + this.gameInfoSet[index], JSON.stringify(this.selectedGameInfo));
    }


    this.screen.fromObject(this.selectedGameInfo.image); // present the image associated with the game

    this.selectedGameInfoIndex = index; // and set the index of the selected game to the actually selected game

};
module.exports = GamePicker;
