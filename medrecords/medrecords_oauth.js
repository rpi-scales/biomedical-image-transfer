/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { KJUR, KEYUTIL } = require('jsrsasign');
var CryptoJS = require('crypto-js');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const { Contract } = require('fabric-contract-api');

const express = require('express')

// Import the axios library, to make HTTP requests
const axios = require('axios')

class MedRec extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const recs = [
            {
                owner: 'Doe, John',
                verificationHash: ,
                hashed: true
                
            },
            {
                owner: 'Derry, Jane',
                verificationHash: ,
                hashed: true
            },
        ];

        for (let i = 0; i < recs.length; i++) {
            recs[i].docType = 'rec';
            await ctx.stub.putState('REC' + i, Buffer.from(JSON.stringify(recs[i])));
            console.info('Added <--> ', recs[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //Returns OAuthHash of file
    async requestRec(ctx, recNumber, requester, hospital){
        
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        
        const requesterExists = await wallet.exists(requester);
        if (!requesterExists) {
            throw new Error(`An identity for the user ${requester} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
        
        const walletContents = await wallet.export(requester);
        const requesterPrivateKey = walletContents.privateKey;

        const rec = JSON.parse(recAsBytes.toString());

        const filehash = rec.verificationHash;
        
        if(rec.hashed){
            throw new Error(`${filename} is not accessable!`)
        }
        
        // This is the client ID and client secret that you obtained
        // while registering the application
        const clientID = requester.getID(); //<your client id>
        const clientSecret = requester.getSecret(); //<your client secret>

        const app = express()

        // Declare the redirect route
        app.get('/oauth/redirect', (req, res) => {
            // The req.query object has the query params that
            // were sent to this route. We want the `code` param
            const requestToken = req.query.code
            axios({
                // make a POST request
                method: 'post',
                // to the Hospital authentication API, with the client ID, client secret
                // and request token
                url: `${hospital}?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
                // Set the content type header, so that we get the response in JSOn
                headers: {
                    accept: 'application/json'
                }
            }).then((response) => {
                // Once we get the response, extract the access token from
                // the response body
                const accessToken = response.data.access_token
                
                // fetch record, including token for autherication
                
                fetch(`${hospital}`, {
                    headers: {
                        // Include the token in the Authorization header
                        Authorization: 'token ' + token
                    }
                })
                // Parse the response as JSON
                .then(res => res.json())
                .then(res => {
                    // calculate Hash from the token
                    var hashToAction = CryptoJS.SHA256(res.megaData).toString();
                    console.log("Hash of the file: " + hashToAction);

                    // get certificate from the certfile
                    const certLoaded = fs.readFileSync(certfile, 'utf8');

                    var requesterPublicKey = KEYUTIL.getKey(certLoaded);
                    var recover = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
                    recover.init(requesterPublicKey);
                    recover.updateHex(hashToAction);
                    var getBackSigValueHex = new Buffer(resultJSON.signature, 'base64').toString('hex');
                    console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
                    /*
                    var bytes = CryptoJS.AES.decrypt(currHash.toString(), userPublicKey);
                    var decryptedFile = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                     
                    console.log(decryptedFile);
                    */

                    return filehash;
                })
                
            })
        })
        
    }

    //Encode verificationHash w/receiver's key
    async giveAccess(ctx, recNumber, owner, recip){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
            throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const recipExists = await wallet.exists(recip);
        if (!recipExists) {
            throw new Error(`An identity for the user ${recip} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const walletContents1 = await wallet.export(owner);
        const ownerPrivateKey = walletContents1.privateKey;

        const walletContents2 = await wallet.export(recip);
        const receiverPublicKey = walletContents2.publicKey;

        const rec = JSON.parse(recAsBytes.toString());

        var sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
        sig.init(receiverPublicKey, "");
        sig.updateHex(hashToAction);
        var sigValueHex = sig.sign();
        var sigValueBase64 = new Buffer(sigValueHex, 'hex').toString('base64');
        console.log("Signature: " + sigValueBase64);

        
        var currHash = rec.verificationHash;
        var bytes = CryptoJS.AES.decrypt(currHash.toString(), ownerPrivateKey);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        

        rec.verificationHash = plaintext;
        rec.hashed = false;

        return rec.hashed;
        
    }

    //Encode verificationHash w/owner's key to abstract knowledge from receiver
    //Unable to remove 
    async revokeAccess(ctx, recNumber, owner){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
           throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
        /*
        const recipExists = await wallet.exists(recip);
        if (!recipExists) {
            throw new Error(`An identity for the user ${recip} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
    */
        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;

        /*
        const walletContents = await wallet.export(recip);
        const receiverPublicKey = walletContents.publicKey;
*/
        const rec = JSON.parse(recAsBytes.toString());

        var currHash = rec.verificationHash;

        if(!rec.hashed){
            throw new Error(`${recNumber} is already hidden`);
        }

        var newHash = CryptoJS.AES.encrypt(currHash, ownerPrivateKey);

        rec.verificationHash = newHash;
        rec.hashed = true;

        return rec.hashed;
    }


    //Creates a record from a given file and owner.
    async createRec(ctx, recNumber, owner, filehash) {
        console.info('============= START : Create Record ===========');

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
            throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;


        var verificationHash = CryptoJS.AES.encrypt(filehash, ownerPrivateKey);

        const rec = {
            owner,
            docType: 'rec',
            verificationHash,
            true,
        };

        await ctx.stub.putState(recNumber, Buffer.from(JSON.stringify(rec)));
        console.info('============= END : Create Record ===========');
    }

    async queryAllRecs(ctx) {
        const startKey = 'REC0';
        const endKey = 'REC999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

}

module.exports = MedRec;
