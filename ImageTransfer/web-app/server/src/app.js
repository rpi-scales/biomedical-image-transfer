'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
var crypto = require("crypto");

let network = require('./fabric/network.js');
const QuickEncrypt = require('quick-encrypt');
const fs = require('fs');

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

//use this identity to query
const appAdmin = 'admin';

//get all assets in world state
app.get('/queryAll', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryAll', '');
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

app.get('/queryByPatient', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', 'Patient');
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

app.get('/queryByDoctor', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', 'Doctor');
  console.log("queryByDoctor!!!!");
  console.log(response);
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

app.post('/registerUser', async (req, res) => {
  let userId = req.body.userId;
  let type = req.body.type;
  let response = await network.registerUser(userId, req.body.firstName, req.body.lastName);
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    let networkObj = await network.connectToNetwork(userId);
    if (networkObj.error) {
      res.send(networkObj.error);
    }

    let keys = QuickEncrypt.generate(2048);
    var keypair = {
      "userId" : userId,
      "public" : keys.public,
      "private" : keys.private
    };
    
    req.body.publicKey = keys.public;
    req.body = JSON.stringify(req.body);
    let args = [req.body];
    let invokeResponse;
    
    if (type == "patient") {
      invokeResponse = await network.invoke(networkObj, false, 'createPatient', args); 
    } else {
      invokeResponse = await network.invoke(networkObj, false, 'createDoctor', args); 
    }
    
    fs.writeFileSync("keys/"+userId+".json", JSON.stringify(keypair));

    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      let parsedResponse = invokeResponse;
      parsedResponse += '. Use userId to login above.';
      res.send(parsedResponse);
    }
  }
});

app.post('/validateUser', async (req, res) => {
  let networkObj = await network.connectToNetwork(req.body.userId);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }

  let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', req.body.userId);
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    let parsedResponse = await JSON.parse(invokeResponse);
    res.send(parsedResponse);
  }

});

app.post('/encryptContent', async(req, res) => {
  console.log("Encrypt File Content Function");
  let userId = req.body.userId;
  let networkObj = await network.connectToNetwork(userId);
  if (networkObj.error) {
    res.send(networkObj.error);
  }
  let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', userId);
  let response = JSON.parse(invokeResponse);
  var encrypted = crypto.publicEncrypt(response.publicKey, Buffer.from(req.body.buffer));
  res.send(encrypted.toString("base64"));
});

app.post('/selectDoctor', async(req, res) => {
  console.log("Select doctor function");
  let userId = req.body.userId;
  let networkObj = await network.connectToNetwork(userId);
  if (networkObj.error) {
    res.send(networkObj.error);
  }

  req.body = JSON.stringify(req.body);
  let args = [req.body];
  let invokeResponse = await network.invoke(networkObj, false, 'createDocRecord', args);

  if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      let parsedResponse = invokeResponse;
      console.log(invokeResponse);
      res.send(parsedResponse);
    }
});

app.post('/queryDocRecord', async(req, res) => {
  console.log("Query document record function");
  let userId = req.body.userId;
  let networkObj = await network.connectToNetwork(userId);
  if (networkObj.error) {
    res.send(networkObj.error);
  }
  let rawdata = fs.readFileSync('keys/'+ userId + '.json');
  let user = JSON.parse(rawdata);
  
  console.log("Encrypted Img Key");
  console.log(req.body.imgKey);

  let decryptedText = QuickEncrypt.decrypt( req.body.imgKey, user.private);
  console.log(decryptedText);
  res.send(decryptedText);
});

app.post('/giveAccessTo', async(req, res) => {
  console.log("Give Access To function");
  let userId = req.body.userId;
  let networkObj = await network.connectToNetwork(userId);
  if (networkObj.error) {
    res.send(networkObj.error);
  }

  let args = [JSON.stringify(req.body)];
  let invokeResponse = await network.invoke(networkObj, false, 'giveAccessTo', args);
  if (invokeResponse.error) {
    res.send(invokeResponse.error);
  } else {
    let parsedResponse = invokeResponse;
    console.log(invokeResponse);
    res.send(parsedResponse);
  }
});


app.listen(process.env.PORT || 8081);