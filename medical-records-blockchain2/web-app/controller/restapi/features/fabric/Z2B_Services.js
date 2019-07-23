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
const sleep = require('sleep');

// const ws = require('websocket');
// const http = require('http');
// const url = require('url');
const express = require('express');
const app = express();
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();

app.set('port', appEnv.port);



/**
 * This class creates an administration connection to a Hyperledger Composer runtime. The
 * connection can then be used to:
 * <ul>
 * <li></li>
 * </ul>
 *
 * @class
 * @memberof module:Z2Blockchain
 */
let  Z2Blockchain  = {

/**
 * create an empty order. This is used by any server side routine that needs to create an new
 * empty order.
 * @param {createOrderTemplate} _inbound - Order created with factory.newResource(NS, 'Order',.orderNumber)
 * @returns {Order} - updated order item with all required fields except for relationships (buyer, seller)
 * @utility
 */
    createRequestTemplate: function (_inbound)
    {
        _inbound.requestNumber = '';
        _inbound.status = JSON.stringify(this.requestStatus.Created);
        return(_inbound);
    },


// /**
//  * supplemental routine to resubmit orders when MVCC_READ_CONFLICT encountered
//  * @param {object} _con - web socket connection
//  * @param {transaction} _item - transaction to process
//  * @param {order_object} _id - order id
//  * @param {BusinessNetworkConnection} businessNetworkConnection - already created business network connection
//  * @returns {promise} promise
//  */
//     loadTransaction: function (_con, _item, _id, businessNetworkConnection)
//     {
//         let method = 'loadTransaction';
//         return businessNetworkConnection.submitTransaction(_item)
//         .then(() => {
//             console.log(method+': request '+_id+' successfully added ');
//             this.send(_con, 'Message', 'Request '+_id+' successfully added');
//         })
//         .catch((error) => {
//             if (error.message.search('MVCC_READ_CONFLICT') !== -1)
//                 {sleep.sleep(5);
//                 console.log(_id+' loadTransaction retrying submit transaction for: '+_id);
//                 this.loadTransaction(_con, _item, _id, businessNetworkConnection);
//                 }
//             });
//     },
/**
 * add an order to a registry. This adds an Asset and does not execute a transaction
 * @param {order_object} _con - websocket
 * @param {assetRegistry} _order - order_object to process
 * @param {networkTransaction} _registry - registry into which asset (order) should be placed
 * @param {networkTransaction} _createNew - transaction to be processed after order successfully added
 * @param {businessNetworkConnection} _bnc - business network connection to use
 * @returns {promise} promise
 */
addRequest: function (_con, _order, _registry, _createNew, _bnc)
{
    let method = 'addRequest';
    return _registry.add(_request)
    .then(() => {
        this.loadTransaction(_con, _createNew, _request.requestNumber, _bnc);
    })
    .catch((error) => {
        if (error.message.search('MVCC_READ_CONFLICT') !== -1)
        {console.log(_request.requestNumber+' addRequest retrying assetRegistry.add for: '+_request.requestNumber);
            this.addRequest(_con, _request, _registry, _createNew, _bnc);
        }
        else {console.log(method+' error with assetRegistry.add', error);}
    });
    },

/**
 * repeats the bind identity request
 * @param {WebSocket} _con - order_object to process
 * @param {String} _id - registry into which asset (order) should be placed
 * @param {String} _cert - transaction to be processed after order successfully added
 * @param {BusinessNetworkConnection} _bnc - business network connection to use
 * @returns {promise} promise
 */
bindIdentity: function (_con, _id, _cert, _bnc)
{
    let method = 'bindIdentity';
    console.log(method+' retrying bindIdentity for: '+_id);
    return _bnc.bindIdentity(_id, _cert)
    .then(() => {
        console.log(method+' Succeeded for: '+_id);
    })
    .catch((error) => {
        if (error.message.search('MVCC_READ_CONFLICT') !== -1)
        {console.log(' bindIdentity retrying _bnc.bindIdentity(_id, _cert) for: '+_id);
            this.bindIdentity(_con, _id, _cert,  _bnc);
        }
        else {console.log(method+' error with _bnc.bindIdentity(_id, _cert) for: '+_id+' with error: ', error);}
    });
},

/**
 * saves the member table with ids and secrets
 * @param {array} _table - array of JSON objects to save to file
 */
    saveMemberTable: function (_table)
    {
        let options = { flag : 'w' };
        let newFile = path.join(path.dirname(require.main.filename),'startup','memberList.txt');
        let _mem = '{"members": [';
        for (let each in _table)
            {(function(_idx, _arr)
                {if(_idx>0){_mem += ', ';} _mem +=JSON.stringify(_arr[_idx]);})(each, _table);}
        _mem += ']}';
        fs.writeFileSync(newFile, _mem, options);
    },


/**
 * formats an Order into a reusable json object. work-around because serializer 
 * was not initially working. This function is no longer in use.
 * @param {Order} _order - the inbound Order item retrieved from a registry
 * @return JSON object order elements
 * @return {Order} JSON object order elements
 * @function
 */
getRequestData: function (_request)
{
    let requestElements = ['status', 'created', 'denied', 'granted', 'revoked'];
    let _obj = {};
    for (let each in requestElements){(function(_idx, _arr)
    { _obj[_arr[_idx]] = _request[_arr[_idx]]; })(each, requestElements);}
    _obj.requestor = _request.requestor.$identifier;
    _obj.owner = _request.owner.$identifier;
    return (_obj);
},

/**
 * JSON object of available order status types and codes. This is used by nodejs 
 * server side code to correctly update order status with identical codes and text.
 */
    orderStatus: {
        Created: {code: 1, text: 'Request Created'},
        Denied: {code: 2, text: 'Request Denied'},
        Granted: {code: 3, text: 'Access Granted'},
        Revoked: {code: 13, text: 'Access Revoked'}
    },
/**
 * New code to support sending messages to socket clients
 * @param {Object} _locals - shared variables and functions from index.js
 * @param {String} type - type of event message to put on channel
 * @param {Event} event - event message
 */
send: function (_locals, type, event)
{
    _locals.processMessages({'type': type, 'data': event} );
}
};

module.exports = Z2Blockchain;