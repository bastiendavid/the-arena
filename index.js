'use strict'

var express = require('express');

var server = express();

// Serve static content
server.use(express.static(__dirname + '/frontend'));

// start server
var port = process.env.PORT || 8080;
server.listen(port, "0.0.0.0", function () {
    console.log('Server started on port ' + port);
});