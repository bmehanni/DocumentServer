== Create by == 
Bassam Mehanni

== Description ==
This is a simple HTTP server that handles GET, PUT and DELETE request to manipulate ASCII encoded files on a remote server.

Requests other than GET/PUT/DELETE:
  The server will respond with 503 Status code, and the Allow header tag will be set to 'GET, PUT, DELETE'

Requests for GET/PUT/DELETE with invalid Uri:
  The Server will responds with 404 Status code

GET:
  - If the requested resource is a file, the body of the reponse will be set to the file content, and the server will respond with 200 status code. 
  - If the requested resource is a directory, the body of the response will be an xml listing the directory content, and the server will respond with 200 status code.

PUT:
  - If the requested URI is a file, the file content will be updated with the request body, and the server will respond with 200 status code, because this is just considered an update to the existing resorurce (http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html.)
  - If the requested URI is for a valid directory, and the body of the request is not empty, the server will create a new file in the request URI and will set the file content to the request body. The server will repond with status code 201, and the header Location tag will be set to the file's URI.
  - If the requested URI is for a valid directory, and the body of the request is empty, the server will create a new directory in the request URI and will set the. The server will repond with status code 201, and the header Location tag will be set to the directory's URI.

DELETE:
  - If the requested URI is a file, the file will be deleted, and the server will respond with status code 204.
  - If the requested URI is a directory, the directory will be deleted, and the server will respond with status code 204.

== How to Run the server ==

  1 - make sure you have node.js 0.6.10 installed (http://nodejs.org/)
  2 - unzip the content of this folder to the root of your hard drive ('C:\')
  3 - open  PowerShell
  4 - navigate to the location where you unziped the content of this folder
  5 - execute 'node index.js', you could optionally execute 'node index.js -d C:\some\other\directory' to run the server at a different location than the current location. 
  6 - congratulations you have document-server running at localhost:8888


== how to run the tests ==
 
  1 - follow the same steps 1 - 3 above
  2 - navigate to C:\the\path\DocumentServer\tests
  3 - execute 'node document-server-tests.js'
