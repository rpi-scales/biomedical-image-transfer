'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');

let network = require('./fabric/network.js');

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
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

app.post('/registerUser', async (req, res) => {
  let userId = req.body.userId;
  let response = await network.registerUser(userId, req.body.firstName, req.body.lastName, req.body.type);
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    let networkObj = await network.connectToNetwork(userId);
    if (networkObj.error) {
      res.send(networkObj.error);
    }
    req.body = JSON.stringify(req.body);
    let args = [req.body];
    let invokeResponse = await network.invoke(networkObj, false, 'createUser', args);
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

app.post('/selectDoctor', async(req, res) => {
  console.log("Select doctor function");
  let userId = req.body.userId;
  let networkObj = await network.connectToNetwork(userId);
  if (networkObj.error) {
    res.send(networkObj.error);
  }
  req.body = JSON.stringify(req.body);
  console.log(req.body);
  let args = [req.body];
  let invokeResponse = await network.invoke(networkObj, false, 'selectDoctor', args);
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      let parsedResponse = invokeResponse;
      res.send(parsedResponse);
    }
});


app.listen(process.env.PORT || 8081);