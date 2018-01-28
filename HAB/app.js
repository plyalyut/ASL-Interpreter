var express = require("express");
var path = require("path");

const apiController = require('./controllers/api');
const staticController = require('./controllers/static');

var app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.get('/', staticController.home);
app.get('/parse', apiController.parse);
app.get('/about', staticController.about);

app.listen(7777,function(){
    console.log("Started listening on port", 7777);
})
