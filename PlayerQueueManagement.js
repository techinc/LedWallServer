function PlayerQueueManagement() {};

PlayerQueueManagement.prototype.init = function() {
    this.waitingQueue = [];

    this.playingQueue = [];

    this.playerLimit = 0;

    return this;
};

PlayerQueueManagement.prototype.startGame = function(playerLimit, onIntroducePlayerFunction, onRemovePlayerFunction ) {

    console.log( 'start game ' + playerLimit ) ;

    this.onIntroducePlayerFunction = onIntroducePlayerFunction;

	this.onRemovePlayerFunction = onRemovePlayerFunction ;

    this.movePlayersToWaitingQueue();


    this.playerLimit = playerLimit;

    while (this.canAddPlayer())
        this.introduceNextPlayer();


};

PlayerQueueManagement.prototype.movePlayersToWaitingQueue = function() {
    console.log( 'move players to waiting queue ' + this.playingQueue.length ) ;
    
    while (this.playingQueue.length > 0)
        this.waitingQueue.push(this.playingQueue.shift());
    
    console.log( 'moved players to waiting queue' ) ;
};

PlayerQueueManagement.prototype.endGame = function() {
    this.onIntroducePlayerFunction = function() {
        console.log('SEMANTIC ERROR: INTRODUCING PLAYER WHILE NO GAME IS PLAYED');
    };

    this.movePlayersToWaitingQueue();

    this.playerLimit = 0;
};

PlayerQueueManagement.prototype.canAddPlayer = function() {
    console.log( 'this.waitingQueue.length ' + this.waitingQueue.length + ' this.playingQueue.length ' + this.playingQueue.length ) ;
    return this.waitingQueue.length > 0 && this.playingQueue.length < this.playerLimit;
}


PlayerQueueManagement.prototype.addConnectingPlayer = function(id) {
    this.waitingQueue.push(id);

    if (this.canAddPlayer()) this.introduceNextPlayer();
};

PlayerQueueManagement.prototype.killPlayer = function(id) {
    console.log( 'before kill player' ) ;
    this.testPrint() ;

    var killedPlayer = this.playingQueue.splice(this.playingQueue.indexOf(id), 1)[0];
    
    console.log( 'KILLED PLAYER ' + killedPlayer ) ;

    this.waitingQueue.push(killedPlayer);

    if (this.canAddPlayer())
        this.introduceNextPlayer();
        
    console.log( 'after kill player' ) ;
    this.testPrint() ;
};


PlayerQueueManagement.prototype.introduceNextPlayer = function() {

    var nextPlayer = this.waitingQueue.shift();
    this.playingQueue.push(nextPlayer);

    console.log( 'INTRODUCING NEXT PLAYER ' + nextPlayer ) ;

    this.onIntroducePlayerFunction(nextPlayer);

    return nextPlayer;
};


PlayerQueueManagement.prototype.removeDisconnectingPlayer = function(id) {
    if (this.waitingQueue.indexOf(id) != -1) this.waitingQueue.splice(this.waitingQueue.indexOf(id), 1);
    else {
        this.playingQueue.splice(this.waitingQueue.indexOf(id), 1);

		this.onRemovePlayerFunction( id ) ;

        if (this.canAddPlayer()) this.introduceNextPlayer();
    }


};


PlayerQueueManagement.prototype.testPrint = function()
{
    console.log( 'playing queue' ) ;
    for( var i in this.playingQueue )
        console.log( this.playingQueue[ i ] ) ;

    console.log( 'waiting queue' ) ;
    for( var i in this.waitingQueue )
        console.log( this.waitingQueue[ i ] ) ;
} ;


module.exports = PlayerQueueManagement;