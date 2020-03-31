//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'first-network', 'connection-org1.json');

exports.connectToNetwork = async function (userId) {
  try {
    let response = {};
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(userId);
    if (!userExists) {
        console.log('An identity for the user '+userId + ' does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        response.error = 'An identity for the user ' +userId + ' does not exist in the wallet. Register ' +userId + ' first.';
        return response;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity:userId, discovery: { enabled: true, asLocalhost: true } });
    
    const network = await gateway.getNetwork('mychannel');

    const contract = network.getContract('ImageTransfer');

    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway
    };

    return networkObj;

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    let response = {};
    response.error = error;
    return response;
  } finally {
    console.log('Done connecting to network.');
  }
}

exports.invoke = async function (networkObj, isQuery, func, args) {
  try {
    if (isQuery === true) {
      if (args) {
        let response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(`Transaction ${func} with args ${args} has been evaluated`);
        await networkObj.gateway.disconnect();
        return response;
      } else {
        let response = await networkObj.contract.evaluateTransaction(func);
        console.log(`Transaction ${func} without args has been evaluated`);
        await networkObj.gateway.disconnect();
        return response;
      }
    } else {
      if (args) {
        args = JSON.parse(args[0]);
        args = JSON.stringify(args);

        let response = await networkObj.contract.submitTransaction(func, args);
        console.log(`Transaction ${func} with args ${args} has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      } else {
        let response = await networkObj.contract.submitTransaction(func);
        console.log(`Transaction ${func} with args has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      }
    }
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
}

exports.registerUser = async function (userId, firstName, lastName) {
  let response = {};
  if(!userId || !firstName || !lastName) {
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    //let response = {};
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists(userId);
    if (userExists) {
      console.log(`An identity for the user ${userId} already exists in the wallet`);
      response.error = `Error! An identity for the user ${userId} already exists in the wallet. Please try 
        another Id.`;
      return response;
    }

    const adminExists = await wallet.exists('admin');
    if(!adminExists){
      console.log('An identity for the admin user "admin" does not exist in the wallet');
      console.log('Run the enrollAdmin.js application before retrying');
      response.error = 'An identity for the admin user "admin" does not exist in the wallet.'
      return response;
    }
  
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID:userId, role: 'client' }, adminIdentity);
    const enrollment = await ca.enroll({ enrollmentID:userId, enrollmentSecret: secret });
    const userIdentity = await X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
    await wallet.import(userId, userIdentity);
    console.log(`Successfully registered user ${firstName} ${lastName}. Use userId ${userId} to login above.`);

    let response = `Successfully registered user ${firstName} ${lastName}. Use userId ${userId} to login above.`;
    return response;
  } catch(error){
    console.error(`Failed to register user + ${userId} + : ${error}`);
    let response = {};
    response.error = error;
    return response;
  }
}

;