
## How to Run (Version 1)

Step 1: Create Required Environment
	Set-up Hyperledger Fabric: https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html

	Pull the "medrecords" folder and place inside fabric-samples
```
cd PATH_TO_FABRIC_FOLDERS/fabric-samples/medrecords
```
	Load required packages
```
$ npm init -y
$ npm install fabric-ca-client fabric-network crypto-js jsrsasign -S
```

Step 2: Set Up Network
```
$ cd ../first-network
$ ./byfn.sh down
$ docker rm -f $(docker ps -aq)
$ docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
```

Step 3: Edit chainpath.config to reflect paths on local machine and launch the Network
```
cd medrecords/GUI/
$./startFabric.sh javascript

$ cd javascript
$ npm install
```

Step 4: Enroll!
```
node enrollAdmin.js

node registerUser.js <"Hospital or Organization Name">
```

Step 5: Upload files to IPFS
If necessary, download and install: https://ipfs.io/docs/install/
```
$ipfs init

$ipfs add <filename>
```
Keep track of the returned hashes!
Step 6: Edit configrsrc.json to Create New Records
Look for datatypes and descriptions of each entry in the object definitions at the top of medrecords.js.

```
$ node invoke.js <"Hospital or Organization of Invoker"> 'createRec'  configrsrc.json
```

Step 7: Query and Invoke with Other Transactions
```
node query.js 
node invoke.js <"Hospital of Invoker"> <args>
```
* Use output of requestRec to possibly access file through IPFS
```
ipfs get <IPFSHash>
```
