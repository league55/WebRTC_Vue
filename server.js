var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, 'dist')));
let port = process.env.PORT || 8080
console.log('port is ' + port)
app.set('port', port);

var server = app.listen(app.get('port'), function() {
  console.log('listening on port ', server.address().port);
});
