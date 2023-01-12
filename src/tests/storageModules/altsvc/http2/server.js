const { request } = require('express');
var express = require('express');
var fs = require('fs');
var https = require('https');
const spdy = require("spdy");
const httpProxy = require('http-proxy');
var path = require('path');
require('dotenv').config()

// var proxy = httpProxy.createProxy({
//   target: {
//     host: 'trust-token.paperscut.',
//     port: 443
//   }
// });

var proxy = httpProxy.createProxyServer({});

const privateKey = fs.readFileSync(process.env.privateKeyPath, 'utf-8');
const certificate = fs.readFileSync(process.env.certificatePath, 'utf-8');

var credentials = {key: privateKey, cert: certificate};

var app = express();


// app.get('/storage/server/altsvc/theresource/', function (request, response) {
    
//     console.log(`Referer of this request: ${request.headers.referer}`);
//     let mySplitPath = request.headers.referer.split('/');
//     response.set({
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
//     })

//     response.send('Response from Port 941')
// });

// app.all('/', function (request, response) {
    
//   console.log(`Referer of this request: ${request.headers.referer}`);
//   let mySplitPath = request.headers.referer.split('/');
//   response.set({
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
//   })

//   response.send('Response from Port 941')
// });



var server = spdy.createServer(credentials, (request, response) => {
  if (request.url.includes("/theresource")) {
    console.log(`Referer of this request: ${request.headers.referer}`);

    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
    });

    response.end('Response from Port 941');

  } else {
    // proxy.proxyRequest(request, response);
    proxy.web(request, response, {
      target: 'https://127.0.0.1:443'
    });
  }
});
server.listen(941);

console.log("Created server running on Port 941");
