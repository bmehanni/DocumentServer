var assert, http, documentServer, fs, path;
var testRunDir, baseDir, badPath, getDir, getUri;
var putDir, putUri, deleteDir, deleteUri;
var yesterday, tomorrow;

initializeRequiredVariables();
initializeTestEnvironment();

// TESTS

//OPTIONS request
http.request({ host : 'localhost', port : '8888', path: '/', method: 'OPTIONS'}, function(res) {
  console.log('When Performing OPTIONS: ');
  assert.equal(res.statusCode, 405, 'Status Code should be 405 but was ' + res.statusCode);
  console.log('   - Status Code should be 405 - Method Not Allowed (Passed)\n');
}).end();

//HEAD request
http.request({ host : 'localhost', port : '8888', path: '/', method: 'HEAD'}, function(res) {
  console.log('When Performing HEAD: ');
  assert.equal(res.statusCode, 405, 'Status Code should be 405 but was ' + res.statusCode);
  console.log('   - Status Code should be 405 - Method Not Allowed (Passed)\n');
}).end();

//POST request
http.request({ host : 'localhost', port : '8888', path: '/', method: 'POST'}, function(res) {
  console.log('When Performing POST: ');
  assert.equal(res.statusCode, 405, 'Status Code should be 405 but was ' + res.statusCode);
  console.log('   - Status Code should be 405 - Method Not Allowed (Passed)\n');
}).end();

//TRACE request
http.request({ host : 'localhost', port : '8888', path: '/', method: 'TRACE'}, function(res) {
  console.log('When Performing TRACE: ');
  assert.equal(res.statusCode, 405, 'Status Code should be 405 but was ' + res.statusCode);
  console.log('   - Status Code should be 405 - Method Not Allowed (Passed)\n');
}).end();

//GET request With Bad/Path
http.request({ host : 'localhost', port : '8888', path: badPath, method: 'GET'}, function(res) {
  console.log('When Performing GET on a bad path (/bad/path): ');
  assert.equal(res.statusCode, 404, 'Status Code should be 404 but was ' + res.statusCode);
  console.log('   - Status Code should be 404 - Not Found (Passed)\n');
}).end();

//PUT request With Bad/Path
http.request({ host : 'localhost', port : '8888', path: badPath, method: 'PUT'}, function(res) {
  console.log('When Performing PUT on a bad path (/bad/path): ');
  assert.equal(res.statusCode, 404, 'Status Code should be 404 but was ' + res.statusCode);
  console.log('   - Status Code should be 404 - Not Found (Passed)\n');
}).end();

//DELETE request With Bad/Path
http.request({ host : 'localhost', port : '8888', path: badPath, method: 'DELETE'}, function(res) {
  console.log('When Performing DELETE on a bad path (/bad/path): ');
  assert.equal(res.statusCode, 404, 'Status Code should be 404 but was ' + res.statusCode);
  console.log('   - Status Code should be 404 - Not Found (Passed)\n');
}).end();

//GET request With Dir/Path	
http.request({ host : 'localhost', port : '8888', path: getUri, method: 'GET'}, function(res) {
  console.log('When Performing GET on a Directory(/Get): ');
  assert.equal(res.statusCode, 200, 'Status Code should be 200 but was ' + res.statusCode);
  console.log('   - Status Code should be 200 - OK (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    var expectedBody = '<?xml version=\"1.0\" ?><dir><item uri=\"'+getUri+'/a\" /><item uri=\"'+getUri+'/s.txt\" /></dir>';
    assert.equal(fullbody, expectedBody, 'expected: ' + expectedBody + ' but was: ' + fullbody);
    console.log('   - Directory content should be sent as xml, "' + fullbody + '" (Passed)\n');
  });
}).end();

//GET request With File/Path	
http.request({ host : 'localhost', port : '8888', path: getUri + '/s.txt', method: 'GET'}, function(res) {
  console.log('When Performing GET on a file(/Get/s.txt): ');
  assert.equal(res.statusCode, 200, 'Status Code should be 200 but was ' + res.statusCode);
  console.log('   - Status Code should be 200 - OK (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    assert.equal(fullbody, 'testing get.');
    console.log('   - File Content should be sent in the body, "' + fullbody + '"  (Passed)\n');
  });
}).end();

//GET request With Dir/Path	with If-Modified-Since datetime earlier than the file modification date
http.request({ host : 'localhost', port : '8888', path: getUri, method: 'GET', headers: { 'If-Modified-Since' : yesterday }}, function(res) {
  console.log('When Performing GET on a Directory(/Get) with If-Modified-Since datetime earlier than the file modification date: ');
  assert.equal(res.statusCode, 200, 'Status Code should be 200 but was ' + res.statusCode);
  console.log('   - Status Code should be 200 - OK (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    var expectedBody = '<?xml version=\"1.0\" ?><dir><item uri=\"'+getUri+'/a\" /><item uri=\"'+getUri+'/s.txt\" /></dir>';
    assert.equal(fullbody, expectedBody, 'expected: ' + expectedBody + ' but was: ' + fullbody);
    console.log('   - Directory content should be sent as xml  as a normal request, "' + fullbody + '" (Passed)\n');
  });
}).end();

//GET request With Dir/Path	with If-Modified-Since datetime later than the file modification date
http.request({ host : 'localhost', port : '8888', path: getUri, method: 'GET', headers: { 'If-Modified-Since' : tomorrow }}, function(res) {
  console.log('When Performing GET on a Directory(/Get)  with If-Modified-Since datetime later than the file modification date: ');
  assert.equal(res.statusCode, 304, 'Status Code should be 304 but was ' + res.statusCode);
  console.log('   - Status Code should be 304 - OK (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    assert.equal(fullbody, '');
    console.log('   - The response body should be empty (Passed)\n');
  });
}).end();

//GET request With File/Path with If-Modified-Since datetime earlier than the file modification date
http.request({ host : 'localhost', port : '8888', path: getUri + '/s.txt', method: 'GET', headers: { 'If-Modified-Since' : yesterday } }, function(res) {
  console.log('When Performing GET on a file(/Get/s.txt) with If-Modified-Since datetime earlier than the file modification date: ');
  assert.equal(res.statusCode, 200, 'Status Code should be 200 but was ' + res.statusCode);
  console.log('   - Status Code should be 200 - OK (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    assert.equal(fullbody, 'testing get.');
    console.log('   - File Content should be sent in the body as a normal request, "' + fullbody + '"  (Passed)\n');
  });
}).end();

//GET request With File/Path with If-Modified-Since datetime later than the file modification date
http.request({ host : 'localhost', port : '8888', path: getUri + '/s.txt', method: 'GET', headers: { 'If-Modified-Since' : tomorrow } }, function(res) {
  console.log('When Performing GET on a file(/Get/s.txt) with If-Modified-Since datetime later than the file modification date: ');
  assert.equal(res.statusCode, 304, 'Status Code should be 304 but was ' + res.statusCode);
  console.log('   - Status Code should be 304 - Not Modified (Passed)');
  
  var fullbody = '';
  res.on('data', function (chunk) {
    fullbody += chunk;
  });
  res.on('end', function() {
    assert.equal(fullbody, '');
    console.log('   - The response body should be empty (Passed)\n');
  });
}).end();

//PUT request With File/Path	
var req = http.request({ host : 'localhost', port : '8888', path: putUri + '/a.txt', method: 'PUT'}, function(res) {
  console.log('When Performing PUT on an existing file(/Put/a.txt): ');
  assert.equal(res.statusCode, 200, 'Status Code should be 200 but was ' + res.statusCode);
  console.log('   - Status Code should be 200 - OK (Passed)');
  
  var data = fs.readFileSync(putDir +  '/a.txt', 'ascii');
  assert.equal(data,'Override file Content','file content should be "override file content" but was "' + data + '"');
  console.log('   - File content should be replaced (Passed)\n');
});
req.write('Override file Content', 'ascii');
req.end();

//PUT request With Directory/Path and empty body
http.request({ host : 'localhost', port : '8888', path: putUri, method: 'PUT'}, function(res) {
  console.log('When Performing PUT with a valid directory path and empty body(/Put): ');
  assert.equal(res.statusCode, 201, 'Status Code should be 201 but was ' + res.statusCode);
  console.log('   - Status Code should be 201 (Passed)');
  
  assert.equal(res.headers['location'], putUri + '/FileOrDir_1', 'location header tag should be set to the URI of the newly created file.');
  console.log('   - Location header tag should be set to the URI of the newly created file (Passed)');
  
  var stat = fs.lstatSync(putDir +  '/FileOrDir_1');
  assert.ok(stat.isDirectory(), 'New Directory should be created at the given path, but no directory was found');
  console.log('   - New Directory should be created at the given path (Passed)\n');
}).end();

//PUT request With Directory/Path and non-empty body
var req = http.request({ host : 'localhost', port : '8888', path: putUri, method: 'PUT'}, function(res) {
  console.log('When Performing PUT with a valid directory path and non-empty body(/Put): ');
  assert.equal(res.statusCode, 201, 'Status Code should be 201 but was ' + res.statusCode);
  console.log('   - Status Code should be 201 (Passed)');
  
  assert.equal(res.headers['location'], putUri + '/FileOrDir_2', 'location header tag should be set to the URI of the newly created file.');
  console.log('   - Location header tag should be set to the URI of the newly created file (Passed)');
  
  var data = fs.readFileSync(putDir +  '/FileOrDir_2', 'ascii');
  assert.ok(data, 'Create New File with this Content' , 'New File should be created at the given path, and the request body should be placed in it, but failed');
  console.log('   - New File should be created at the given path, and request body should be placed in it (Passed)\n');
});
req.write('Create New File with this Content');
req.end();

//DELETE request With Directory/Path
http.request({ host : 'localhost', port : '8888', path: deleteUri + '/a', method: 'DELETE'}, function(res) {
  console.log('When Performing DELETE with a valid directory path: ');
  assert.equal(res.statusCode, 204, 'Status Code should be 204 but was ' + res.statusCode);
  console.log('   - Status Code should be 204 (Passed)');
  
  assert.ok(!path.existsSync(deleteDir + '\\a'), 'The directory should have been deleted');
  console.log('   - Directory should be deleted (Passed)\n');
}).end();

//DELETE request With File/Path
http.request({ host : 'localhost', port : '8888', path: deleteUri + '/s.txt', method: 'DELETE'}, function(res) {
  console.log('When Performing DELETE with a valid directory path: ');
  assert.equal(res.statusCode, 204, 'Status Code should be 204 but was ' + res.statusCode);
  console.log('   - Status Code should be 204 (Passed)');
  
  assert.ok(!path.existsSync(deleteDir + '\\s.txt'), 'The directory should have been deleted');
  console.log('   - File should be deleted (Passed)\n');
  documentServer.server.close();
}).end();

//Helper methods
function initializeTestEnvironment() {
  //Create test data container
  fs.mkdirSync(baseDir);

  //Create data for GET testing
  fs.mkdirSync(getDir);
  fs.mkdirSync(getDir + '/a');
  fs.writeFileSync(getDir + '/s.txt', 'testing get.', 'ascii');

  //Create data for PUT testing
  fs.mkdirSync(putDir);
  fs.writeFileSync(putDir + '/a.txt', 'Sample data', 'ascii');

  //Create data for DELETE testing
  fs.mkdirSync(deleteDir);
  fs.mkdirSync(deleteDir + '/a');
  fs.writeFileSync(deleteDir + '/s.txt', 'testing delete.', 'ascii');

  //start server
  documentServer.server.listen(8888);
}

function initializeRequiredVariables() {
  assert = require('assert');
  http = require('http');
  documentServer = require('../document-server');
  fs = require('fs');
  path = require('path');

  //define test data directories and URIs
  testRunDir = getNewTestDirectoryName();
  baseDir = __dirname + testRunDir;
  badPath = '/bad/path';

  getDir = baseDir + '/Get';
  getUri = testRunDir + '/Get';

  putDir = baseDir + '/Put';
  putUri = testRunDir + '/Put';

  deleteDir = baseDir + '/Delete';
  deleteUri = testRunDir + '/Delete';

  yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);

  tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
}

function getNewTestDirectoryName() {
  //return the name of the directory that will hold the test data
  //it looks for the maximmum extension and increment it by one
  //for example, if the tests directory has only a directory named TestRun_1,
  //this method returns /TestRun_2
  
  var dir = fs.readdirSync(__dirname);
  var newRunIndex  = 0;
  for (i = 0; i < dir.length; i++){
    if(dir[i].indexOf('TestRun_') >= 0){
	    var index = parseInt(dir[i].slice(8));
	    if (index > newRunIndex)
	      newRunIndex = index;
	  }
  }
  
  return '/TestRun_' + (++newRunIndex);
}