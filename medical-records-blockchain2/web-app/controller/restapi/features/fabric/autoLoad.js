/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * This file is used to automatically populate the network with Order assets and members
 * The opening section loads node modules required for this set of nodejs services
 * to work. This module also uses services created specifically for this tutorial, 
 * in the Z2B_Services.js.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Bring Fabric SDK network class
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

//const financeCoID = 'easymoney@easymoneyinc.com';
const svc = require('./Z2B_Services');


/**
 * autoLoad reads the memberList.json file from the Startup folder and adds members,
 * executes the identity process, and then loads orders
 *
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * saves a table of members and a table of items
 * @function
 */
exports.autoLoad = async function autoLoad(req, res, next) {

    console.log('autoload');

    // get the autoload file
    let newFile = path.join(path.dirname(require.main.filename),'startup','memberList.json');
    let startupFile = JSON.parse(fs.readFileSync(newFile));        

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('medicalrecords');

        //get list of requestors, owners
        const responseRequestor = await contract.evaluateTransaction('GetState', "requestors");
        let requestors = JSON.parse(JSON.parse(responseRequestor.toString()));
                
        const responseOwner = await contract.evaluateTransaction('GetState', "owners");
        let owners = JSON.parse(JSON.parse(responseOwner.toString()));
 
        //iterate through the list of members in the memberList.json file        
        for (let member of startupFile.members) {

            console.log('\nmember.id: ' + member.id);
            console.log('member.type: ' + member.type);
            console.log('member.companyName: ' + member.companyName);

            var transaction = 'Register' + member.type;
            console.log('transaction: ' + transaction);            

            for (let requestor of requestors) { 
                if (requestor == member.id) {
                    res.send({'error': 'member id already exists'});
                }
            }
            for (let owner of owners) { 
                if (owner == member.id) {
                    res.send({'error': 'member id already exists'});
                }
            }
                        
            //register a owner, requestor
            const response = await contract.submitTransaction(transaction, member.id, member.companyName);
            console.log('transaction response: ')
            console.log(JSON.parse(response.toString()));  
                                            
            console.log('Next');                

        } 
        

        let allRequests = new Array();

        console.log('Get all requests'); 
        for (let requestor of requestors) { 
            const requestorResponse = await contract.evaluateTransaction('GetState', requestor);
            var _requestorjsn = JSON.parse(JSON.parse(requestorResponse.toString()));       
            
            for (let requestNo of _requestorjsn.requests) {                 
                allRequests.push(requestNo);            
            }                           
        }

        console.log('Go through all requests'); 
        for (let request of startupFile.assets) {

            console.log('\nrequest.requestNumber: ' + request.requestNumber);
            console.log('request.requestorId: ' + request.requestorId);
            console.log('request.ownerId: ' + request.ownerId);
            console.log('request.recordId: ' + request.recordId);

            for (let requestNo of allRequests) { 
                if (requestNo == request.requestNumber) {
                    res.send({'error': 'request already exists'});
                }
            }            

            const createRequestResponse = await contract.submitTransaction('CreateRequest', request.requestorId, request.ownerId, request.requestNumber,request.recordId);
            console.log('createRequestResponse: ')
            console.log(JSON.parse(createRequestResponse.toString()));

            console.log('Next');
                      
        }
        
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('AutoLoad Complete');
        await gateway.disconnect();
        res.send({'result': 'Success'});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.message});
    }

};
