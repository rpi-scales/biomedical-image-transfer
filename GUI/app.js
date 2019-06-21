const express = require('express');
const path = require('path');
const routes = require('./routes/index');

const app = express();

yaml = require('yamljs');

const fs = require('fs');

var MedRec = require('../medrecords/medrecords');

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/yaml', function(req, res){
	
	let rawdata = fs.readFileSync('../medrecords/configrsrc.json');  
	let data = JSON.parse(rawdata); 
	
	console.log("Gathering Data:\n");
	console.log("============================ Start ============================");
	console.log(data);
	console.log("============================ Finish ============================");
	
	var nativeObject = yaml.load('./transactions/configrsrc.yaml');

	res.send(data);
});

app.post('/giveAccess', function(req, res) {
	MedRec.giveAccess(1,2,3);
})

module.exports = app;