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

app.post('/selectDoctor', async (req, res) => {
  let networkObj = await network.connectToNetwork(req.body.userId);
  req.body = JSON.stringify(req.body);
  let args = [req.body];
  
  let response = await network.invoke(networkObj, false, 'selectDoctor', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // let parsedResponse = await JSON.parse(response);
    res.send(response);
  }
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
    //connect to network and update the state with voterId  

    let invokeResponse = await network.invoke(networkObj, false, 'createUser', args);
    console.log(typeof invokeResponse);
    console.log(invokeResponse);
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += '. UseuserId to login above.';
      res.send(parsedResponse);
    }
  }
});

//used as a way to login the voter to the app and make sure they haven't voted before 
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


app.listen(process.env.PORT || 8081);