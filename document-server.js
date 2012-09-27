var util   = require('util');
var http  = require('http');
var url   = require('url');
var fs    = require('fs');
var path  = require('path');
 
var base_dir = getBaseDir(); 

exports.server = http.createServer(onRequest);

function onRequest(request, response) { //all incoming requests are initially handled by this method
  if (request.url === '/favicon.ico') { 
    //requests from a browser send another request for favicon.ico, this block just silence those requests
    response.writeHead(200, {'Content-Type': 'image/x-icon'} );
    response.end();
    return;
  }
  
  var requestedPath = path.normalize(base_dir + request.url);
  
  if (path.existsSync(requestedPath))
    handleIncomingRequest(requestedPath, request, response);
  else
    create404Response(response, requestedPath);
}


// Main request handlers
function handleIncomingRequest(requestedPath, request, response) {
  var stat = fs.lstatSync(requestedPath);

  if(request.method == 'GET')
    handleGETRequest(requestedPath, stat, request, response);
  else if (request.method == 'PUT')
    handlePUTRequest(requestedPath, stat, request, response);
  else if (request.method == 'DELETE')
    handleDELETERequest(requestedPath, stat, request, response);  
  else
    create405Response(response); //If the request method is not allowed return 405 response 
}

function handleGETRequest(requestedPath, stat, request, response) {
  var respondWith304 = false;
  var ifModifiedSince = request.headers['if-modified-since'];
  
  if(ifModifiedSince) {
    var fileModificationTimeStamp = Date.parse(stat.mtime);
	  var ifModifiedSinceTimeStamp = Date.parse(ifModifiedSince);
	
    // respond with 304 if the fileModificationDate is earlier than the if-modified-since header
	  respondWith304 = fileModificationTimeStamp <= ifModifiedSinceTimeStamp; 
  }
  
  if(respondWith304) {
    create304Response(response);
  }
  else {
    if(stat.isFile())
      addFileToResponseBody(requestedPath, stat, response);
    else
      listDirectoryContent(requestedPath, stat, request, response);
  }
}

function handlePUTRequest(requestedPath, stat, request, response) {
  var fullBody = '';
	
  request.on('data', function(chunk) { 
    //start capturing the body of the request
    fullBody += chunk.toString();
  });
	
  request.on('end', function() {
    //at this point we have received the complete body of the request
    
    if (stat.isFile()) { 
      //if the uri is referencing an already existing file, then we consider it an unpdate to the existing file
      //refer to: http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
      fs.writeFileSync(requestedPath, fullBody);
	    response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('200 OK - File updated successfully: ' + requestedPath.replace('\\', '/')); 
	  }
    else {
	    var newFileOrDirectoryName = getNewFileOrDirectoryName(requestedPath); //get a name for the new resource
      var newFileOrDirPath = path.normalize(requestedPath + '//' + newFileOrDirectoryName );
      var uri = request.url + '\/' + newFileOrDirectoryName;
	
	    if(fullBody)
        fs.writeFileSync(newFileOrDirPath, fullBody); // write new file if the body is not empty
	    else
        fs.mkdirSync(newFileOrDirPath);  // create a new directory if the body is empty
	
      response.writeHead(201, {'Content-Type': 'text/plain', 'Location' : uri});
      response.end('201 - File or Directory created successfully: ' + uri); 
	}
  });
}

function handleDELETERequest(requestedPath, stat, request, response) {
  if(stat.isFile())
    fs.unlinkSync(requestedPath);
  else
    fs.rmdirSync(requestedPath);
	
  create204Response(response);
}

//response methods
function create204Response(response) {
  response.writeHead(204, {'Content-Type': 'text/plain'});
  response.end();
}

function create304Response(response) {
  response.writeHead(304, {'Content-Type': 'text/plain'});
  response.end();
}

function create400Response(response) {
  response.writeHead(400, {'Content-Type': 'text/plain'});
  response.end('400 Bad Request - Invalid input');
}

function create404Response(response, requestedPath) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.end('404 Not Found - File Or Directory not found: ' + requestedPath);
}

function create405Response(response) {
  response.writeHead(405, {'Content-Type': 'text/plain', 'Allow' : 'GET, PUT, DELETE'});
  response.end(); 
}

//Helper methods
function getNewFileOrDirectoryName(requestedPath) {
  //return the name of the new file or directory that will be created
  //it looks for the maximmum extension and increment it by one
  //for example, if the base_dir contains only one file named FileOrDir_1,
  //this method returns FileOrDir_2
  
  var dir = fs.readdirSync(requestedPath);
  var newFileIndex  = 0;
  for (i = 0; i < dir.length; i++){
    if(dir[i].indexOf('FileOrDir_') >= 0){
	    var index = parseInt(dir[i].slice(10));
	    if (index > newFileIndex)
	      newFileIndex = index;
	  }
  }
  
  return 'FileOrDir_' + (++newFileIndex);
}

function listDirectoryContent(requestedPath, stat, request, response) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/xml");
  response.write('<?xml version="1.0" ?>');
  response.write('<dir>');
  var dir = fs.readdirSync(requestedPath);
  
  for (i = 0; i < dir.length; i++) 
    response.write('<item uri="' + request.url + '\/' + dir[i] + '" />');
	
  response.end('</dir>');  
}

function addFileToResponseBody(requestedPath, stat, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.setHeader('Content-Length', stat.size);
  response.setHeader('Last-Modified', stat.mtime);
  
  var data = fs.readFileSync(requestedPath, 'ascii');
  response.end(data);
}

function getBaseDir() { 
  var dir = process.cwd();
  
  for (i = 0; i < process.argv.length; i++) {
    if(process.argv[i] == '-d') {
	  if(i == process.argv.length - 1)
	    throw new Error('invalid number of arguments, Please startup the server using "node DocumentServer.js" or "node DocumentServer.js -d BASE_DIR"'); 
	  else
         dir = process.argv[i+1];
   
      break;   
	}
  }
 
  dir = path.normalize(dir);
  var stats = fs.lstatSync(dir);
  if(!stats.isDirectory())
    throw new Error('The supplied BASE_DIR does not exists'); 
	
  return dir;	
}