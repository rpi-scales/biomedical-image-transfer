/**
 * Structure of functions:
 *  Register user
 *  1. Connect to the network
 *  2. Run a function in network.js 
 */
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
var crypto = require("crypto");

let network = require('./fabric/network.js');
const fs = require('fs');


const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

//use this identity to query
const appAdmin = 'admin';

// get all assets in world state
app.get('/queryAll', async (req, res) => {
    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryAll', '');
    try {
        let parsedResponse = await JSON.parse(response);
        res.send(parsedResponse);
    } catch (error) {
        console.log(`Unable to run queryAll: ${error}`);
        res.send(error);
    }
});

// query all doctors in the world state
app.get('/queryByDoctor', async (req, res) => {
    console.log("Query doctor function");
    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryByObjectType', 'Doctor');
    try {
        let parsedResponse = await JSON.parse(response);
        res.send(parsedResponse);
    } catch (error) {
        console.log(`Unable to run queryByDoctor: ${error}`);
        res.send(error);
    }
});

// register user
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
        // Generate public and private key pair for the user
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: 'top secret'
            }
        });


        var keys = {
            "userId" : userId,
            "public" : publicKey,
            "private" : privateKey
        };
        
        req.body.publicKey = publicKey;
        req.body = JSON.stringify(req.body);
        let args = [req.body];
        let invokeResponse;
        
        if (type == "patient") {
            invokeResponse = await network.invoke(networkObj, false, 'createPatient', args); 
        } else {
            invokeResponse = await network.invoke(networkObj, false, 'createDoctor', args); 
        }
        
        fs.writeFileSync("keys/"+userId+".json", JSON.stringify(keys));

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
        try{
            let parsedResponse = await JSON.parse(invokeResponse);
            res.send(parsedResponse);
        } catch (error) {
            res.send(error);
        }
    }
});

// Use doctor's public key to encrypt the content
// public key is fetched from database
app.post('/encryptContent', async(req, res) => {
    console.log("Encrypt File Content Function");
    let userId = req.body.userId;
    let networkObj = await network.connectToNetwork(userId);
    if (networkObj.error) {
        res.send(networkObj.error);
    }
    let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', req.body.picked);
    try {
        let user = JSON.parse(invokeResponse);
        console.log(req.body.buffer);
        var encrypted = crypto.publicEncrypt(user.publicKey, Buffer.from(req.body.buffer));
        res.send(encrypted);
    } catch (error) {
        res.send(error);
    }
    
});

// Use doctor's private key to decrypt the content
// private key can be fetched from local directories
// It should take in doctor id, picked user
app.post('/decryptContent', async(req, res) => {
    console.log("Query document record function");
    let userId = req.body.userId;
    let networkObj = await network.connectToNetwork(userId);
    if (networkObj.error) {
        res.send(networkObj.error);
    }
    try {
        let rawdata = fs.readFileSync('keys/'+ userId + '.json');
        let user = JSON.parse(rawdata);

        let decrypted = crypto.privateDecrypt(user.private, Buffer.from(req.body.encrypted));
        console.log(decrypted);
        res.send(decrypted);
    } catch (error) {
        res.send(error);
    }
    
});

app.post('/updateImageKey', async(req, res) => {
    console.log("Update Image Key function");
    let userId = req.body.userId;
    let networkObj = await network.connectToNetwork(userId);
    if (networkObj.error) {
        res.send(networkObj.error);
    }

    req.body = JSON.stringify(req.body);
    let args = [req.body];
    let invokeResponse = await network.invoke(networkObj, false, 'updateImageKey', args);

    if (invokeResponse.error) {
        res.send(invokeResponse.error);
    } else {
    let parsedResponse = invokeResponse;
    console.log(invokeResponse);
    res.send(parsedResponse);
    }
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

app.post('/queryPatients', async(req, res) => {
    console.log("Query all patients a doctor has");
    let doctorId = req.body.doctorId;
    let networkObj = await network.connectToNetwork(doctorId);
    if(networkObj.error) {
        res.send(networkObj.error);
    }
    let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', doctorId);
    try{
        let doctor = JSON.parse(invokeResponse);
        let patients = [];
        var i;
        for (i = 0; i < doctor.primaryPatientRecords.length; i++) {
            patients.push(doctor.primaryPatientRecords[i].UserId);
        }
        console.log(patients);
        res.send(patients); //Not sure if this is possible
    } catch (error) {
        res.send(error);
    }
  
});

app.post('/fetchRecord', async(req, res) => {
    console.log("Fetching patient record");
    let doctorId = req.body.doctorId;
    let networkObj = await network.connectToNetwork(doctorId);
    if(networkObj.error) {
        res.send(networkObj.error);
    }
    let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', doctorId);
    let doctor = JSON.parse(invokeResponse);
    let patient;
    var i;
    for (i = 0; i < doctor.primaryPatientRecords.length; i++) {
        if(doctor.primaryPatientRecords[i].UserId == req.body.patientId) {
            patient = doctor.primaryPatientRecords[i];
            break;
        }
    }
    console.log(patient);
    res.send(patient);
});

app.post('/shareInfowith', async(req, res)=> {
    console.log("Share patient information with another doctor");
    let userId = req.body.userId;
    let networkObj = await network.connectToNetwork(userId);
    if(networkObj.error) {
        res.send(networkObj.error);
    }
    let invokeResponse = await network.invoke(networkObj, false, 'shareInfowith', [JSON.stringify(req.body)]);
    res.send(invokeResponse);
})


app.listen(process.env.PORT || 8081);