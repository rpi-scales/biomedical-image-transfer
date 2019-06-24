

const shim = require('fabric-shim');

const Chaincode = class {

	async Init(stub) {
		//use the instantiate input arguments to decide init chaincode state vals

		//save initial state
		await stub.putState(key, Buffer.from(aStringValue));
		return shim.success(Buffer.from('Initialized Successfully!'));
	}

	async Invoke(stub) {
		//use invoke input args to decide intended changes

		//retrieve existing chaincode states
		let oldVal = await stub.getState(key);

		//calculate new state values and save them
		let newVal = oldVal + delta;
		await stub.putState(key, Buffer.from(newValue));

		return shim.success(Buffer.from(newVal.toString()));
	}
}
module.exports.Chaincode = Chaincode; 