//imports the IPFS API
const IPFS = require("ipfs-api");
const ipfs = IPFS("localhost", "5001", {protocol: "http"});
console.log(ipfs);
export default ipfs;