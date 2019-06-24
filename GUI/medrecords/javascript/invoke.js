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

const MedRec = require('./medrecords');
module.exports.contracts = ['UpdateValues'];

async function main() {
    try {
        //Name of invoker.
        const user = process.argv[2];

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

        if(process.argv.length < 3){
           console.log(`Incorrect number of arguments. Must be 3.`);
            return; 
        }
        else{
            const txn = process.argv[3];

            if(typeof txn != "string" || txn.includes(" ")){
                console.log(`Incorrect format for ${txn}.`);
                console.log(`Must be formatted as \"camelCase\"`);
                return;
            }
            if(txn != 'createRec'){          
                const recNum = process.argv[4];
                if(isNaN(recNum)){
                    console.log(`Incorrect format for ${recNum}.`);
                    console.log(`Must be integer between 0 and 999`);
                    return;
                }
            }

            let reqName, ownName, recipName, purpose, configFile;

            if(txn == 'queryRec' || txn == 'listAudits')
            {
                console.log(recNum);
                if(process.argv.length != 7){
                    console.log(`Incorrect number of arguments. Must be 7.`);
                    return;
                }
            
                else{
                    reqName = process.argv[5];
                    if(typeof reqName != "string"){
                        console.log(`Incorrect format for ${reqName}.`);
                        console.log(`Must be formatted as \"Hospital or Organization Name\"`);
                        return;
                    }
                    console.log(recNum);
                    await contract.submitTransaction(txn, recNum, reqName);

                    purpose = process.argv[6];
                    if(typeof reqName != "string"){
                        console.log(`Incorrect format for ${purpose}.`);
                        console.log(`Must be formatted as a string`);
                        return;
                    }
                    console.log(purpose);
                    await contract.submitTransaction(txn, recNum, reqName, purpose);

                }
            }
            else if((txn == 'revokeAccess'))
            {
                console.log(recNum);
                if(process.argv.length != 5){
                    console.log(`Incorrect number of arguments. Must be 5.`);
                    return;
                }
                else{
                    await contract.submitTransaction(txn, recNum);
                }
            }
            else if((txn == 'giveAccess'))
            {
                console.log(recNum);
                if(process.argv.length != 6){
                    console.log(`Incorrect number of arguments. Must be 6`);
                    return;
                }
            
                else{
                    recipName = process.argv[5];
                    if(typeof recipName != "string"){
                        console.log(`Incorrect format for ${recipName}.`);
                        console.log(`Must be formatted as \"Hospital Name\"`);
                        return;
                    }
                    await contract.submitTransaction(txn, recNum, user, recipName);

                }
            }
            else if(txn == 'createRec')
            {
                if( process.argv.length != 5){
                    console.log(`Incorrect number of arguments. Must be 5.`);
                    return;
                }
                else{

                    configFile = process.argv[4];
                    if(typeof configFile != "string"){
                        console.log(`Incorrect format for ${configFile}.`);
                        console.log(`Must be formatted as a string.`);
                        return;
                    }
                    if(!(configFile.substring(configFile.length-5) === ".json")){
                        console.log(`Incorrect format for ${configFile}.`);
                        console.log(`Must be formatted as a JSON file.`);
                        return;
                    }
                    await contract.submitTransaction(txn, configFile);
                }
            }
            else{
                console.log(`Transaction is not defined.`);
                    return;
            }
        }

        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();