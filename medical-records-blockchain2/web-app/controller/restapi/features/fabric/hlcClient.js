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


'use strict';
let fs = require('fs');
let path = require('path');

const svc = require('./Z2B_Services');

// Bring Fabric SDK network class
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


/**
 * get orders for buyer with ID =  _id
 * @param {express.req} req - the inbound request object from the client
 *  req.body.id - the id of the buyer making the request
 *  req.body.userID - the user id of the buyer in the identity table making this request
 *  req.body.secret - the pw of this user.
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.getMyRequests = async function (req, res, next) {
    // connect to the network
    let method = 'getMyRequests';
    console.log(method+' req.body.userID is: '+req.body.userID );
    let allRequests = new Array();

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to contract
        const contract = await network.getContract('medicalrecords');

        // Get member state
        const responseMember = await contract.evaluateTransaction('GetState', req.body.userID);
        console.log('responseMember: ');
        console.log(JSON.parse(responseMember.toString()));
        let member = JSON.parse(JSON.parse(responseMember.toString()))

        // Get the orders for the member including their state
        for (let requestNo of member.requests) { 
            const response = await contract.evaluateTransaction('GetState', requestNo);
            console.log('response: ');
            console.log(JSON.parse(response.toString()));
            var _jsn = JSON.parse(JSON.parse(response.toString()));

            allRequests.push(_jsn);            
        }

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('getMyRequests Complete');
        await gateway.disconnect();
        res.send({'result': 'success', 'requests': allRequests});
        
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 
};



/**
 * orderAction - act on an order for a buyer
 * @param {express.req} req - the inbound request object from the client
 * req.body.action - string with buyer requested action
 * buyer available actions are:
 * Pay  - approve payment for an order
 * Dispute - dispute an existing order. requires a reason
 * Purchase - submit created order to seller for execution
 * Cancel - cancel an existing order
 * req.body.participant - string with buyer id
 * req.body.orderNo - string with orderNo to be acted upon
 * req.body.reason - reason for dispute, required for dispute processing to proceed
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.requestAction = async function (req, res, next) {
    let method = 'requestAction';
    console.log(method+' req.body.participant is: '+req.body.participant );

    if (svc.m_connection === null) {svc.createMessageSocket();}

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('medicalrecords');


        // Get state of order
        const responseRequest = await contract.evaluateTransaction('GetState', req.body.requestNo);
        console.log('responseRequest: ');
        console.log(JSON.parse(responseRequest.toString()));
        let request = JSON.parse(JSON.parse(responseRequest.toString()));
        
        // Perform action on the order
        switch (req.body.action)
        {
        case 'Deny':
            console.log('Deny entered');
            const denyResponse = await contract.submitTransaction('Deny', request.requestNumber, request.requestorId, request.ownerId);
            console.log('denyResponse: ');
            console.log(JSON.parse(denyResponse.toString()));
            break;
        case 'Grant':
            console.log('Grant entered');
            const grantResponse = await contract.submitTransaction('Grant', request.requestNumber, request.requestorId, request.ownerId);
            console.log('grantResponse_response: ');
            console.log(JSON.parse(grantResponse.toString()));            
            break;
        case 'Revoke':
            console.log('Revoke entered');
            const revokeResponse = await contract.submitTransaction('Revoke', request.requestNumber, request.requestorId, request.ownerId);
            console.log('revokeResponse: ');
            console.log(JSON.parse(revokeResponse.toString()));             
            break;
        default :
            console.log('default entered for action: '+req.body.action);
            res.send({'result': 'failed', 'error':' request '+req.body.requestNo+' unrecognized request: '+req.body.action});
        }
        
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('requestAction Complete');
        await gateway.disconnect();
        res.send({'result': ' request '+req.body.requestNo+' successfully updated to '+req.body.action});
            
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 

};

/**
 * adds an order to the blockchain
 * @param {express.req} req - the inbound request object from the client
 * req.body.seller - string with seller id
 * req.body.buyer - string with buyer id
 * req.body.items - array with items for order
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.addRequest = async function (req, res, next) {
    let method = 'addRequest';
    console.log(method+' req.body.requestor is: '+req.body.requestor );    
    let requestNo = '00' + Math.floor(Math.random() * 10000);
    let request = {};
    request = svc.createRequestTemplate(request);
    if (svc.m_connection === null) {svc.createMessageSocket();}

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('medicalrecords');


        const createRequestResponse = await contract.submitTransaction('CreateRequest', req.body.requestor, req.body.owner, requestNumber, req.body.recordId);
        console.log('createRequestResponse: ')
        console.log(JSON.parse(createRequestResponse.toString()));

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('addRequest Complete');
        await gateway.disconnect();
        res.send({'result': ' request '+requestNo+' successfully added'});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 
    
};



