function PlayerQueueManagement() {};

PlayerQueueManagement.prototype.init = function() {
    this.waitingQueue = [];

    this.playingQueue = [];

    this.playerLimit = 0;

    return this;
};

PlayerQueueManagement.prototype.startGame = function(playerLimit, onIntroducePlayerFunction) {
    this.onIntroducePlayerFunction = onIntroducePlayerFunction;

    this.movePlayersToWaitingQueue();


    this.playerLimit = playerLimit;

    while (this.canAddPlayer())

    this.introduceNextPlayer();


};

PlayerQueueManagement.prototype.movePlayersToWaitingQueue = function() {
    while (this.playingQueue.length > 0)

    this.waitingQueue.push(this.playingQueue.shift());
};

PlayerQueueManagement.prototype.endGame = function() {
    this.onIntroducePlayerFunction = function() {
        console.log('SEMANTIC ERROR: INTRODUCING PLAYER WHILE NO GAME IS PLAYED');
    };

    this.movePlayersToWaitingQueue();

    this.playerLimit = 0;
};

PlayerQueueManagement.prototype.canAddPlayer = function() {
    return this.waitingQueue.length > 0 && this.playingQueue.length < this.playerLimit;
}


PlayerQueueManagement.prototype.addConnectingPlayer = function(id) {
    this.waitingQueue.push(id);

    if (this.canAddPlayer()) this.introduceNextPlayer();
};

PlayerQueueManagement.prototype.killPlayer = function(id) {
    var killedPlayer = this.playingQueue.splice(this.waitingQueue.indexOf(id), 1);

    this.waitingQueue.push(killedPlayer);

    if (this.canAddPlayer())

    this.introduceNextPlayer();
};


PlayerQueueManagement.prototype.introduceNextPlayer = function() {
    var nextPlayer = this.waitingQueue.shift();
    this.playingQueue.push(nextPlayer);


    this.onIntroducePlayerFunction(nextPlayer);

    return nextPlayer;
};


PlayerQueueManagement.prototype.removeDisconnectingPlayer = function(id) {
    if (this.waitingQueue.indexOf(id) != -1) this.waitingQueue.splice(this.waitingQueue.indexOf(id), 1);
    else {
        this.playingQueue.splice(this.waitingQueue.indexOf(id), 1);

        if (this.canAddPlayer()) this.introduceNextPlayer();
    }


};


module.exports = PlayerQueueManagement;