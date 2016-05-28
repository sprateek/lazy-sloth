var http = require('http');
var url = require('url');

var PORT = 8080;
var DEBUG = false;

var config = {
  "host": "AYL9A14ZPVEKQ.iot.ap-southeast-1.amazonaws.com",
  "port": 8883,
  "clientId": "encore",
  "thingName": "encore",
  "caCert": "root-CA.crt",
  "clientCert": "174e27046d-certificate.pem.crt",
  "privateKey": "174e27046d-private.pem.key"
}

var awsIot = require('aws-iot-device-sdk');

var device = awsIot.device(config);

/********************************** Helpers ***********************************/

function info(content) {
  console.log(content);
}

function debug(content) {
  if(DEBUG) info(content);
}

/************************************ App *************************************/

function onNewData(data) {
  var items = data.split(',');
  var dateString = new Date().toString();
  dateString = dateString.substring(dateString.indexOf(':') - 2);
  dateString = dateString.substring(0, dateString.indexOf('G') - 1);
  info(dateString + ' - Got data: ' + data + ' (' + items.length + ' items)');

  // Do stuff with the data
  // Do something here
  device.publish('topic_2', JSON.stringify({ test_data: 1}));
}

function onRequest(request, response) {
  var reqUrl = request.url;
  debug('Got a request: ' + reqUrl);

  if(reqUrl.indexOf('/analytics') > -1) {
    // App request
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;
    var data = query.data;

    onNewData(data);    

    response.end('OK\n');
  } else {
    response.end('Error\n');
  }
}

function setupServer() {
  var server = http.createServer(onRequest);
  server.listen(PORT, function() {
    info('Server started listening on port ' + PORT);
  });
}

setupServer();
