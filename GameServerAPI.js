var AbstractScreen = require('./AbstractScreen');
var http = require('http');
var querystring = require('querystring');


function GameServerAPI() {}

GameServerAPI.prototype.init = function( port ) // initCallback, timeCycleCallback, stopCallback, introducePlayerCallback, removePlayerCallback, playerCommandCallback )
    {
     var self = this ;
    /* 
     this.initCallback              = initCallback      ;
     this.timeCycleCallback         = timeCycleCallback ;
     this.stopCallback              = stopCallback      ;
    
     this.introducePlayerCallback   = introducePlayerCallback   ;
     this.removePlayerCallback      = removePlayerCallback      ;
     
     this.playerCommandCallback     = playerCommandCallback     ;
    */
    
     http.createServer(function(req, res) {
        if (req.url == '/init')                { self.processRequest( req, res, function( data ) 
            {
             self.remoteAddress = req.connection.remoteAddress ;
             self.serverPort = data.serverPort ;
             self.serverPath = data.serverPath ;              
             self.screen = (new AbstractScreen()).init( data.width, data.height); 
             self.start( data.width, data.height ) ;
            } ) ; } 
        else if (req.url == '/timeCycle')      
            {
             self.processRequest( req, null, function( data ) { self.timeCycle( self.screen ) ; } ) ;
             res.end(JSON.stringify({
                type: "bitmap",
                content: self.screen.toObject()  } ) );
            } 
        else if (req.url == '/stop')           { self.processRequest( req, res, function( data ) { self.stop( data ) ; } ) ; } 
        else if (req.url == '/introduce')      { self.processRequest( req, res, function( data ) 
            { console.log( 'introduce data ' + data ) ; self.introducePlayer( data ) ; 
            } ) ; } 
        else if (req.url == '/removePlayer')   { self.processRequest( req, res, function( data ) { self.removePlayer( data ) ; } ) ; } 
        else if (req.url == '/playerCommand')  { self.processRequest( req, res, function( data ) { self.playerCommand( data ) ; } ) ; } 
        else if (req.url == '/error')          { self.processRequest( req, res, function( data ) { console.log( data ) ; } ) ; } 

     } ).listen( port, 'localhost') ; 
     return this ;
    } ;


GameServerAPI.prototype.processRequest = function( req, res, callback )
    {
     var responseData = "";

     req.on('data', function(chunk) {
        responseData += chunk;
     });

     req.on('end', function() {
        callback( JSON.parse( responseData ) ) ;
        
        if( res )
            res.end();
     });

    } ;


GameServerAPI.prototype.killPlayer = function( id )
    {
     var options = 
        {
         host: this.remoteAddress,
         port: this.serverPort,
         path: this.serverPath + '/killPlayer',
         method: 'POST'
        };

     var request = http.request(options, function(res) { res.setEncoding( 'utf8' ) ; } ) ;

     request.on('error', function(e) { console.log('problem with request: ' + e.message); });
     
     request.write(querystring.stringify( {playerId: id }));
     request.end();
    } ;


module.exports = GameServerAPI ;


