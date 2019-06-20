const express = require('express');
const path = require('path');
const routes = require('./routes/index');

const app = express();

yaml = require('yamljs');

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/yaml', function(req, res){
	var nativeObject = yaml.load('./transactions/configrsrc.yaml');
//	res.json(nativeObject);
	res.send(nativeObject);
});

module.exports = app;