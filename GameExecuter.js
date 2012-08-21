define( [ 'http' ], function( http )
{

function GameExecuter() {} 


GameExecuter.prototype.init = function( screen, gameInfo )
    {
     var self = this ;
    
     this.screen = screen ;
    
     this.gameInfo = gameInfo ;
    

     this.initRequest() ;
     
     
     this.previousTime = ( new Date() ).getTime() ;
     
     return this ;
    } ;
    


GameExecuter.prototype.initRequest = function()
    {
    
     var self = this ;
    
     var options = {
        host: this.gameInfo.host,
        port: this.gameInfo.port,
        path: this.gameInfo.path + '/init',
        method: 'POST'
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
        
        res.on( 'end', function()
        {
             self.timeCycleInterval = setInterval( function()
                {
                 var elapsedTime = ( new Date() ).getTime() - self.previousTime ;
         
                 self.timeCycleRequest( elapsedTime ) ;
         
                }, self.gameInfo.frameDuration ? self.gameInfo.frameDuration : 50 ) ;
        
        } ) ;
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(JSON.stringify( { serverUrl: "", width: self.screen.width, height: self.screen.height } ) );
    req.end();
    
    
    } ;


GameExecuter.prototype.timeCycleRequest = function()
    {
     var self = this ;
     
     var options = {
        host: this.gameInfo.host,
        port: this.gameInfo.port,
        path: this.gameInfo.path + '/timeCycle',
        method: 'POST'
    };

    var queryData = "" ;

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk );
            
            queryData += chunk ;
            
        });
        
        
         res.on('end', function () {
            
            var obj = JSON.parse( queryData ) ;
            
            if( obj.type == "bitmap" )
                self.screen.fromObject( obj.content ) ;
        });

    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(JSON.stringify( { serverUrl: "", } ) );
    req.end();
    
    
    } ;



GameExecuter.prototype.stopRequest = function( callback )
    {
     var self = this ;
     clearInterval( this.timeCycleInterval ) ;
     

     var options = {
        host: this.gameInfo.host,
        port: this.gameInfo.port,
        path: this.gameInfo.path + '/stop',
        method: 'POST'
    };

    console.log( options ) ;
    var queryData = "" ;

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk );
            
            queryData += chunk ;
            
        });
        
        res.on( 'end', callback ) ;

         
    });


    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    

    req.end();
    
    
    } ;




return GameExecuter ;
} ) ;