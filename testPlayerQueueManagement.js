var PlayerQueueManagement = require( './PlayerQueueManagement' ) ;

var pq = ( new PlayerQueueManagement() ).init() ;


var testFunction = function( id ) { console.log( 'introducing player ' + id ) ; } 

pq.startGame( 1, testFunction ) ;



for( var i = 1 ; i < 5 ; i++ ) pq.addConnectingPlayer( i ) ;


pq.endGame() ;

for( var i = 6 ; i < 9 ; i++ ) pq.addConnectingPlayer( i ) ;


pq.startGame( 20, testFunction ) ;