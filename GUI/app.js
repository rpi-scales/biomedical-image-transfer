'use strict';

const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const shim = require('fabric-shim');

const app = express();

yaml = require('yamljs');

const fs = require('fs');

var MedRec = require('./medrecords/medrecords');


var medRec = new MedRec();

shim.start(new Chaincode());

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/yaml', function(req, res){
	
	let rawdata = fs.readFileSync('./medrecords/configrsrc.json');  
	let data = JSON.parse(rawdata); 
	
	
	console.log("Gathering Data:\n");
	console.log("============================ Start ============================");
	console.log(data);
	console.log("============================ Finish ============================");
	console.log("Creating record...");
	var newRec = medRec.createRec(ctx, "Albany Medical Center", data);
	//ctx.set(newRec.resID, newRec);
	
//	var nativeObject = yaml.load('./transactions/configrsrc.yaml');

	res.send(data);
});

app.get('/giveAccess', function(req, res) {
	
	console.log("Transaction Id: " + req.query.trans_id);
	console.log("Owner's Name: " + req.query.owner);
	console.log("Recipient's Name: " + req.query.receptor);
	medRec.giveAccess(ctx, req.query.trans_id, req.query.owner, req.query.receptor);

})

module.exports = app;