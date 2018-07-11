var express = require('express'); // app server
var app = express();

app.use(express.static('./')); // load UI from public folder

app.listen(4001, function() {

})
