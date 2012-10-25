var fs = require('fs');
var path = require('path');
var ecstatic = require('ecstatic');
var file = ecstatic('./log', {
    autoIndex : true,
    cache : 30
});
var file2 = ecstatic(path.dirname(__filename), { autoIndex: false });

require('http').createServer(function(request, response){
    request.addListener('end', function(){
        console.log("Received request for: ", request.url);
        if(request.url === '/view'){
            response.writeHead(301, { 'location' : '/view/'});
            return response.end();
        }

        if(request.url.substring(0, 5) === '/view'){
            console.log("Incomming request for: ", request.url);
            var url = request.url;
            request.url = url.substring(5, url.length);
            if(request.url === '') request.url = 'index.html';
            
            file2(request, response, function(){
                console.log("Request for view", arguments);
            }); 
        }else{ 
            file(request, response, function(){
                console.log("Request for logs", arguments);
            });
        }
    });
}).listen(7890);

console.log("Filename", __filename, "dirname", path.dirname(__filename));
//console.log("Process", process);
console.log("CWD", process.cwd());
