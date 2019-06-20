# Medical Record Sharing System
## Introduction
The healthcare data is stored on a secure, permissioned chain which greatly increase the ease of access to information from different hospitals. For example, if a user is visiting the hospital for the first time, then the doctor can quickly obtain user's medical histories after a previous practitioner gives access.

### transactions
requestRec
Attempt to access a file on the ledger
Inputs: transaction, Record number, requester name (last, first)
Outputs: string filehash

giveAccess
Decrypts a given record's hash of a file IPFS hash to enable sharing.
Inputs: transaction, Record number, owner name (last, first), recipient name
Outputs: boolean filehash hashed or not

revokeAccess
Encrypts filename with owner's private key to disable access
Inputs: transaction, Record number, owner first and last name
Outputs: boolean filehash hashed or not

createRec
creates a new record
Inputs: transaction, Record number, owner first and last name, file IPFS hash

queryAllRecs
Displays all of the records in the channel.



## How to Run

Step 1: Create Required Environment
Set-up Hyperledger Fabric: https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html

Pull the "medrecords" folder and place inside fabric-samples
```
cd PATH_TO_FABRIC_FOLDERS/fabric-samples/medrecords
```
Load required packages
```
$ npm init -y
$ npm install fabric-ca-client fabric-network crypto-js jsrsasign passport-http-bearer exif -S
```

Step 2: Set Up Network
```
$ cd ../first-network
$ ./byfn.sh down
// The next two commands only need to run once. If you have already run it once before, ignore them
$ docker rm -f $(docker ps -aq)
$ docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
```

Step 3: Launch the Network
```
$./startFabric.sh javascript

$ cd javascript
$ npm install
```

Step 4: Enroll!
```
node enrollAdmin.js

node registerUser.js <"Last Name, First Name">
```

Step 5: Upload files to IPFS
Download and install: https://ipfs.io/docs/install/
```
$ipfs init

$ipfs add <filename>
```

Step 6: Use IPFSHash to Create New Records

```
$ node invoke.js 'createRec' <recNum> <"Owner Last Name, Owner First"> <IPFSHash>
```

Step 7: Query and Invoke with Other Transactions
```
node query.js
node invoke.js <args>
```
* Use output of requestRec to possibly access file through IPFS
```
ipfs get <IPFSHash>
```


## Current difficulties
How do we store medical records securely? Is an encrypted link a proper method? If so, what should determine the key for a file and how/where should the key be stored?

Can we store a list of owners so that a subsequent owner after the original owner can give access to others that it distributes the file to? Is this smart?

Can we only share with one person at a time since the hash can only be encrypted for a single recipient? Or can this recipient re-hash the original?

Should we make giveAccess function, or can we just use gpg?

Current implementation: gives complete access to file w/giveAccess function and can revokeAccess if file believed to be tampered with. However, user will still be able to decode it if they have the hash, because they have signature access. What is a better way to do this?
