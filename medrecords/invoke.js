/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {
        if(argc < 3){
           console.log(`Incorrect number of arguments. Must be 5.`);
            return; 
        }
        else{
            const txn = process.argv[2];

            if(typeof txn != "string" || !txn.includes(" ")){
                console.log(`Incorrect format for ${txn}.`);
                console.log(`Must be formatted as \"camelCase\"`);
                return;
            }
            const recNum = process.argv[3];
            if(typeof recNum != "number"){
                console.log(`Incorrect format for ${recNum}.`);
                console.log(`Must be integer between 0 and 999`);
                return;
            }
            else if(recNum < 0 || recNum >999){
                console.log(`Incorrect format for ${recNum}.`);
                console.log(`Must be integer between 0 and 999`);
                return;
            }

            const reqName, ownName, recipName, hash;

            if(txn == 'requestRec' && argc != 5)
            {
                console.log(`Incorrect number of arguments. Must be 5.`);
                return;
            }
            else{
                reqName = process.argv[4];
                if(typeof reqName != "string" || !reqName.includes(", ")){
                    console.log(`Incorrect format for ${reqName}.`);
                    console.log(`Must be formatted as \"LastName, FirstName\"`);
                    return;
                }

            }
            if((txn == 'revokeAccess') && argc != 5)
            {
                console.log(`Incorrect number of arguments. Must be 5.`);
                return;
            }
            else{
                ownName = process.argv[4];
                if(typeof ownName != "string" || !ownName.includes(", ")){
                    console.log(`Incorrect format for ${ownName}.`);
                    console.log(`Must be formatted as \"LastName, FirstName\"`);
                    return;
                }
            }
            if((txn == 'giveAccess') && argc != 6)
            {
                console.log(`Incorrect number of arguments. Must be 5.`);
                return;
            }
            else{
                ownName = process.argv[4];
                if(typeof ownName != "string" || !ownName.includes(", ")){
                    console.log(`Incorrect format for ${ownName}.`);
                    console.log(`Must be formatted as \"LastName, FirstName\"`);
                    return;
                }
                recipName = process.argv[5];
                if(typeof recipName != "string" || !recipName.includes(", ")){
                    console.log(`Incorrect format for ${recipName}.`);
                    console.log(`Must be formatted as \"LastName, FirstName\"`);
                    return;
                }

            }
            if(txn == 'createRec' && argc != 6)
            {
                console.log(`Incorrect number of arguments. Must be 5.`);
                return;
            }
            else{
                ownName = process.argv[4];
                if(typeof ownName != "string" || !ownName.includes(", ")){
                    console.log(`Incorrect format for ${ownName}.`);
                    console.log(`Must be formatted as \"LastName, FirstName\"`);
                    return;
                }
                hash = process.argv[5];
                if(typeof ownName != "string"){
                    console.log(`Incorrect format for ${hash}.`);
                    console.log(`Must be formatted as a string.`);
                    return;
                }
            }
            if(txn == 'createRec' && argc != 3)
            {
                console.log(`Incorrect number of arguments. Must be 5.`);
                return;
            }
        }
        


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            console.log(`An identity for the user, ${user}, does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('medrec');

        // Submit the specified transaction.
        // createRec transaction - requires 4 arguments, ex: ('createRec', 'Jane', 'Doe', FILE)
        await contract.submitTransaction('createRec', recNum, ownName, hash);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();