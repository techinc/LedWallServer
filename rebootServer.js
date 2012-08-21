var http = require( 'http' ) ;
var exec = require('child_process').exec;


http.createServer( function( req, res ) 
    {
     console.log( 'executing node ./r.js ./main.js' ) ;
    
     exec( 'node ./r.js ./main.js' ) ;
     
     res.end() ;
    
    } ).listen( 1112 ) ;