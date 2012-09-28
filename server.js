var stat = require('node-static');
var fs = require('fs');
var path = require('path');
var file = new(stat.Server)('./log');
var file2 = new(stat.Server)(path.dirname(__filename));

require('http').createServer(function(request, response){
    request.addListener('end', function(){
        console.log("Received request for: ", request.url);
        console.log("DEBUG", request.url.substring(0,5));
        if(request.url.substring(0, 5) === '/view'){
            var url = request.url;
            request.url = url.substring(5, url.length);
            if(request.url === '') request.url = 'index.html';
            console.log('URL is now: ', request.url);
            
            file2.serve(request, response); 
        }else if(request.url === '/'){
            //Serve up a file list
            fs.readdir('./log', function(err, files){
                if(err){
                    response.writeHead(500);
                    return response.write(err.toString());
                }
                response.write('<html><body><ul>');
                for(var i = 0; i < files.length; i++){
                    response.write('<li>');
                    response.write('<a href="'+files[i]+'">'+files[i]+'</a>');
                    response.write('</li>');
                }
                response.end('</ul></body></html>');
            });
        }else{
            file.serve(request, response);
        }
    });
}).listen(7890);

console.log("Filename", __filename, "dirname", path.dirname(__filename));
//console.log("Process", process);
console.log("CWD", process.cwd());
