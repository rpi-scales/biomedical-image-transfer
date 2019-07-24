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

// z2c-events.js

'use strict';

let wsSocket;

/**
 * load the four initial user roles into a single page.
 */
function singleUX ()
{
    console.log('singleUX');
    let toLoad = 'singleUX.html';
    if ((typeof(requestors) === 'undefined') || (requestors === null) || (requestors.length === 0))
    { 
        showLoad();
        $.when($.get(toLoad), deferredMemberLoad()).done(function (_page, _res)
        {
            hideLoad();
            $('#body').empty();
            $('#body').append(_page);
            loadRequestorUX();
            loadOwnerUX();
        });
    }
    else{
        showLoad();
        $.when($.get(toLoad)).done(function(_page)
        {
            hideLoad();
            $('#body').empty();
            $('#body').append(_page);
            loadRequestorUX();
            loadOwnerUX();
        });
    }
}
/**
 * load all of the members in the network for use in the different user experiences. This is a synchronous routine and is executed autormatically on web app start. 
 * However, if this is a newly created network, then there are no members to retrieve and this will create four empty arrays
 */
function memberLoad ()
{
    let options = {};
    options.registry = 'Owner';
    let options2 = {};
    options2.registry = 'Requestor';
    showLoad();
    $.when($.post('/fabric/admin/getMembers', options), $.post('/fabric/admin/getMembers', options2)).done(function (_owners, _requestors)
        {
        requestors = dropDummy(_requestors[0].members);
        owners = dropDummy(_owners[0].members);
        let s_string = _getMembers(owners);
        hideLoad();

        });
}
/**
 * dropDummy() removes 'noop@dummy' from memberlist
 * @param {String} _in - member id to ignore
 */
function dropDummy(_in)
{
    let _a = new Array();
    for (let each in _in){(function(_idx, _arr){if (_arr[_idx].id.slice(0,10) !== 'noop@dummy'){_a.push(_arr[_idx]);}})(each, _in);}
    return _a;
}
/**
 * load all of the members in the network for use in the different user experiences. This routine is designed for use if the network has been newly deployed and the web app was
 * started before the autoLoad function was run on the newly deployed network (which, by default, is empty).
 */
function deferredMemberLoad()
{
    let d_prompts = $.Deferred();
    let options = {};
    options.registry = 'Owner';
    let options2 = {};
    options2.registry = 'Requestor';
    $.when($.post('/fabric/admin/getMembers', options), $.post('/fabric/admin/getMembers', options2)).done(function (_owners, _requestors)
        {
            requestors = dropDummy(_requestors[0].members);
            owners = dropDummy(_owners[0].members);
            s_string = _getMembers(owners);
            d_prompts.resolve();
        }).fail(d_prompts.reject);
    return d_prompts.promise();
}
/**
 * return an option list for use in an HTML <select> element from the provided member array.
 * @param {Array} _members - array of members
 * @returns {String} - populated select string
 */
function _getMembers(_members)
{
    let _str = '';
    for (let each in _members)
    {(function(_idx, _arr){_str +='<option value="'+_arr[_idx].id+'">' +_arr[_idx].companyName+'</option>';})(each, _members);}
    _str += '</select>';
    return _str;
}

/**
 * @param {Event} _event - inbound Event
 * @param {String} _id - subscriber target
 * @param {String} _orderID - inbound order id
 */
function addNotification(_event, _id, _requestID)
{
    let method = 'addNotification';
    console.log(method+' _event'+_event+' id: '+_id+' requestID: '+_requestID);
    let type = getSubscriber(_id);
    if (type === 'none') {return;}
    switch(type)
    {
    case 'Requestor':
        r_alerts.push({'event': _event, 'request': _requestID});
        toggleAlert(r_notify, r_alerts, r_count);
        break;
    case 'Owner':
        o_alerts.push({'event': _event, 'request': _requestID});
        toggleAlert(o_notify, o_alerts, o_count);
        break;
    default:
        console.log(method+' default entered for: '+type);
        break;
    }
}
/**
 * 
 * @param {jQuery} _target - jquery object to update
 * @param {Array} _array - array of alerts for this member
 * @param {jQuery} _count - jQuery object to hold alert count
 */
function toggleAlert(_target, _array, _count)
{
    if (_array.length < 1)
    {$(_target).removeClass('on'); $(_target).addClass('off'); }
    else {$(_count).empty(); $(_count).append(_array.length);
        $(_target).removeClass('off'); $(_target).addClass('on'); }

}
/**
 * check to see if _id is subscribing
 * @param {Integer} _id - member id to seek
 * @returns {String} - type of member
 */
function getSubscriber(_id)
{
    let type = 'none';
    for (let each in subscribers){(function(_idx, _arr){if (_arr[_idx].id === _id){type=_arr[_idx].type;}})(each, subscribers);}
    return(type);
}
/**
 * subscribe to events
 * @param {String} _type - member type
 * @param {String} _id - member id
 */
function z2bSubscribe(_type, _id)
{
    subscribers.push({'type': _type, 'id': _id});
}
/**
 * Unsubscribe to events
 * @param {String} _id - member id to remove
 */
function z2bUnSubscribe(_id)
{
    let _s1 = subscribers;
    let _s2 = [];
    for (let each in _s1) {(function(_idx, _arr){if (_arr[_idx] != _id){_s2.push(_arr[_idx]);}})(each, _s1);}
    subscribers = _s2;
}
/**
 * notifyMe
 * @param {Array} _alerts - array of alerts
 * @param {String} _id - orderID
 * @returns {Boolean} - true if found, false if not found
 */
function notifyMe (_alerts, _id)
{
    let b_h = false;
    for (let each in _alerts) {(function(_idx, _arr){if (_id === _arr[_idx].order){b_h = true;}})(each, _alerts);}
    return b_h;
}
/**
 * connect to web socket
 */
function wsConnect()
{
    let method = 'wsConnect';
    if (!window.WebSocket) {console.log('this browser does not support web sockets');}
    let content = $('#body');
    let blockchain = $('#blockchain');
    // updated from ws: to wss: to support access over https
    if (host_address.slice(0,9) === 'localhost')
    {
        wsSocket = new WebSocket('ws://'+host_address);
    }else
    {
        wsSocket = new WebSocket('wss://'+host_address);
    }
    wsSocket.onerror = function (error) {console.log('WebSocket error on wsSocket: ', error);};
    wsSocket.onopen = function ()
    {console.log ('connect.onOpen initiated to: '+host_address); wsSocket.send('connected to client');};
    wsSocket.onmessage = function (message)
    {
        let incoming
        incoming = message.data;
        // console.log(method+ ' incoming is: '+incoming);
        while (incoming instanceof Object === false){incoming = JSON.parse(incoming);}
        switch (incoming.type)
        {
        case 'Message':
            content.append(formatMessage(incoming.data));
            break;
        case 'Alert':
            let event = JSON.parse(incoming.data);
            addNotification(event.type, event.ID, event.orderID);
            break;
        case 'BlockChain':
            _blctr ++;
            if (incoming.data !== 'connected')
            {
                $(blockchain).append('<span class="block">block '+incoming.data.header.number+'<br/>Hash: '+incoming.data.header.data_hash+'</span>');
                if (_blctr > 4) {let leftPos = $(blockchain).scrollLeft(); $(blockchain).animate({scrollLeft: leftPos + 300}, 250);}
            }
            break;
        default:
            console.log('Can Not Process message type: ',incoming.type);
        }
    };
}


function showLoad() {    
    $("#loadMe").modal({
        backdrop: "static", //remove ability to close modal with click
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
    });          
}

function hideLoad() {
    $("#loadMe").modal("hide");    
}