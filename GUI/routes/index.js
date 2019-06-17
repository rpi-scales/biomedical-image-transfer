const express = require('express');
const path = require('path');
const router = express.Router();

yaml = require('yamljs');
fs   = require('fs');

router.get('/', (req, res) => {
	nativeObject = yaml.load('./transactions/configrsrc.yaml');
	console.log(nativeObject);
	res.sendFile(path.join(__dirname+'/Dashboard.html'));
});

module.exports = router;