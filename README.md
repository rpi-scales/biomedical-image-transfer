# Medical Record Sharing System
## Introduction
The healthcare data is stored on a secure, permissioned chain which greatly increase the ease of access to information from different hospitals. For example, if a user is visiting the hospital for the first time, then the doctor can quickly obtain user's medical histories after a previous practitioner gives access. 

### Transactions
**requestRec**:
Attempt to access a file on the ledger
Inputs: transaction, Record number, requester name (last, first)
Outputs: string filehash

**giveAccess**:
Decrypts a given record's hash of a file IPFS hash to enable sharing.
Inputs: transaction, Record number, owner name (last, first), recipient name
Outputs: boolean filehash hashed or not

**revokeAccess**:
Encrypts filename with owner's private key to disable access
Inputs: transaction, Record number, owner first and last name
Outputs: boolean filehash hashed or not

**createRec**:
Creates a new record 
Inputs: transaction, Record number, owner first and last name, file IPFS hash

**queryAllRecs**:
Displays all of the records in the channel.

## Setting up (Version 2)
*It is easier to use [Homebrew](https://brew.sh/) to install prerequisites for Mac Users*
1. Install [required environment](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html). 
2. Pull biomedical-image-transfer using `git clone https://github.com/rpi-scales/biomedical-image-transfer.git`. 
3. Go to biomedical-image-transfer directory using `cd PATH_TO_FABRIC_FOLDERS/biomedical-image-transfer`. 
4. If you have run the application(i.e. `./startFabric.sh javascript`) before, make sure to execute the following steps:
```bash
# Switch to first-sample folder and run
$ ./byfn.sh down 
# Clear docker images and containers
$ docker rm -f $(docker ps -aq)
$ docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
```
5. Go to medrecords directory using `cd GUI/medrecords` and run `./startFabric.sh javascript`.
6. Install npm for medrecords. 
```bash
$ cd javascript
$ npm install
```
7. Install related packages for GUI. 
```bash
# Go back to GUI directory
$ cd ..
# Install Node.js dependencies
$ npm init -y
$ npm install --save express

$ npm install --save-dev nodemon
$ npm install jsrsasign crypto-js fabric-network fabric-contract-api fabric-shim
$ npm install fs path yamljs
# Install npm watch
$ npm install npm-watch

# You can lanch the dashboard using the following command
$ npm run watch
```
8. Switch back to medrecords directory using `cd medrecords/javascript` and enroll. If you are getting errors in the following steps, please try `npm rebuild`. 
```bash
$ node enrollAdmin.js
$ node registerUser.js <"Hospital or Organization Name">
``` 
9. Upload files to [IPFS](https://ipfs.io/docs/install/). Keep track of the returned hashes!
```bash
$ ipfs init
$ ipfs add <filename>
```
10. Edit configrsrc.json to Create New Records. Look for datatypes and descriptions of each entry in the object definitions at the top of medrecords.js.
```bash
$ node invoke.js <"Hospital or Organization of Invoker"> 'createRec'  configrsrc.json
```
11. Query and Invoke with Other Transactions. 
```bash
$ node query.js 
$ node invoke.js <"Hospital of Invoker"> <args>
```
12. Use output of requestRec to possibly access file through IPFS `ipfs get <IPFSHash>`. 

## Current difficulties
How do we store medical records securely? Is an encrypted link a proper method? If so, what should determine the key for a file and how/where should the key be stored?

Can we store a list of owners so that a subsequent owner after the original owner can give access to others that it distributes the file to? Is this smart?

Can we only share with one person at a time since the hash can only be encrypted for a single recipient? Or can this recipient re-hash the original?

Should we make giveAccess function, or can we just use gpg?

Current implementation: gives complete access to file w/giveAccess function and can revokeAccess if file believed to be tampered with. However, user will still be able to decode it if they have the hash, because they have signature access. What is a better way to do this?

## Useful Links
1. Hyperledger Fabric presentations and exercises https://github.com/LennartFr/2019-current-blockchain-apps
2. Hyperledger tutorials https://hyperledger-fabric.readthedocs.io/en/latest/tutorials.html
