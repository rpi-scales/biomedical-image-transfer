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

// z2c-owner.js

'use strict';
let ownerRequestDiv = 'ownerRequestDiv';
let o_alerts = [];
let o_notify = '#owner_notify';
let o_count = '#owner_count';
let o_id;
/**
 * load the administration owner Experience
 */
function loadOwnerUX ()
{
    let toLoad = 'owner.html';
    if (requestors.length === 0) 
    { $.when($.get(toLoad), deferredMemberLoad()).done(function (page, res)
    {setupOwner(page[0]);});
    }
    else{
        $.when($.get(toLoad)).done(function (page)
        {setupOwner(page);});
    }
}

function loadOwnerUXFull ()
{
    let toLoad = 'owner.html';
    if (requestors.length === 0) 
    { $.when($.get(toLoad), deferredMemberLoad()).done(function (page, res)
    {setupOwnerFull(page[0]);});
    }
    else{
        $.when($.get(toLoad)).done(function (page)
        {setupOwnerFull(page);});
    }
}

/**
 * load the administration User Experience
 * @param {String} page - page to load
 */
function setupOwner(page)
{
    $('#ownerbody').empty();
    $('#ownerbody').append(page);
    if (o_alerts.length == 0) 
    {$(o_notify).removeClass('on'); $(o_notify).addClass('off'); }
    else {$(o_notify).removeClass('off'); $(o_notify).addClass('on'); }
    updatePage('owner');
    let _clear = $('#owner_clear');
    let _list = $('#ownerRequestStatus');
    let _requestDiv = $('#'+ownerRequestDiv);
    _clear.on('click', function(){_requestDiv.empty();});
    //
    // this section changes from the previous chapter, requestor changing to owner
    //
    _list.on('click', function(){listOwnerRequests();});
    $('#owner').empty();
    $('#owner').append(o_string);
    $('#ownerCompany').empty();
    $('#ownerCompany').append(owners[0].companyName);
    o_id = owners[0].id;
    z2bSubscribe('Owner', o_id);
    // create a function to execute when the user selects a different provider
      $('#owner').on('change', function() {
        $('#ownerCompany').empty(); _requestDiv.empty(); $('#owner_messages').empty();
        $('#ownerCompany').append(findMember($('#owner').find(':selected').val(),owners).companyName);
        z2bUnSubscribe(o_id);
        o_id = findMember($('#owner').find(':selected').text(),owners).id;
        z2bSubscribe('Owner', o_id);
    });
}


function setupOwnerFull(page, port)
{
    $('#body').empty();
    $('#body').append(page);
    if (o_alerts.length == 0) 
    {$(o_notify).removeClass('on'); $(o_notify).addClass('off'); }
    else {$(o_notify).removeClass('off'); $(o_notify).addClass('on'); }
    updatePage('owner');
    let _clear = $('#owner_clear');
    let _list = $('#ownerRequestStatus');
    let _requestDiv = $('#'+ownerRequestDiv);
    _clear.on('click', function(){_requestDiv.empty();});
    //
    // this section changes from the previous chapter, requestor changing to owner
    //
    _list.on('click', function(){listOwnerRequests();});
    $('#owner').empty();
    $('#owner').append(o_string);
    $('#ownerCompany').empty();
    $('#ownerCompany').append(owners[0].companyName);
    o_id = owners[0].id;
    z2bSubscribe('Owner', o_id);
    // create a function to execute when the user selects a different provider
      $('#owner').on('change', function() {
        $('#ownerCompany').empty(); _requestDiv.empty(); $('#owner_messages').empty();
        $('#ownerCompany').append(findMember($('#owner').find(':selected').val(),owners).companyName);
        z2bUnSubscribe(o_id);
        o_id = findMember($('#owner').find(':selected').text(),owners).id;
        z2bSubscribe('Owner', o_id);
    });
}

/**
 * lists all requests for the selected owner
 */
function listOwnerRequests()
{
    let options = {};
    //
    // owner instead of requestor
    //
    options.id= $('#owner').find(':selected').val();
    options.userID = options.id;
    showLoad();
    $.when($.post('/fabric/client/getMyRequests', options)).done(function(_results)
    {
        hideLoad();
        if (_results.requests.length < 1) {$('#ownerRequestDiv').empty(); $('#ownerRequestDiv').append(formatMessage(textPrompts.requestProcess.o_no_request_msg+options.id));}
        else{formatOwnerRequests($('#ownerRequestDiv'), _results.requests);}
    });
}
/**
 * used by the listRequests() function
 * formats the requests for a requestor. requests to be formatted are provided in the _requests array
 * output replaces the current contents of the html element identified by _target
 * @param {String} _target - string with div id prefaced by #
 * @param {Array} _requests - array with request objects
 */
function formatOwnerRequests(_target, _requests)
{
    _target.empty();
    let _str = ''; let _date = '';
    for (let each in _requests)
    {(function(_idx, _arr)
        { let _action = '<th><select id=o_action'+_idx+'><option value="'+textPrompts.requestProcess.NoAction.select+'">'+textPrompts.requestProcess.NoAction.message+'</option>';
        //
        // each request can have different states and the action that a requestor can take is directly dependent on the state of the request. 
        // this switch/case table displays selected request information based on its current status and displays selected actions, which
        // are limited by the sate of the request.
        //
        // Throughout this code, you will see many different objects referemced by 'textPrompts.requestProcess.(something)' 
        // These are the text strings which will be displayed in the browser and are retrieved from the prompts.json file 
        // associated with the language selected by the web user.
        //
        switch (JSON.parse(_arr[_idx].status).code)
        {
        case requestStatus.Revoked.code:
            //_date = _arr[_idx].paymentRequested;
            _action += '<option value="'+textPrompts.requestProcess.Revoke.select+'">'+textPrompts.requestProcess.Revoke.message+'</option>';
            break;
        case requestStatus.Denied.code:
            //_date = _arr[_idx].bought;
            _action += '<option value="'+textPrompts.requestProcess.Deny.select+'">'+textPrompts.requestProcess.Deny.message+'</option>';
            break;
        case requestStatus.Granted.code:
            _action += '<option value="'+textPrompts.requestProcess.Grant.select+'">'+textPrompts.requestProcess.Grant.message+'</option>';
            break;
        default:
            break;
        }
        let _button = '<th><button id="o_btn_'+_idx+'">'+textPrompts.requestProcess.ex_button+'</button></th>'
        _action += '</select>';
        if (_idx > 0) {_str += '<div class="spacer"></div>';}
        _str += '<table class="wide"><tr><th>'+textPrompts.requestProcess.requestno+'</th><th>'+textPrompts.requestProcess.status+'</th><th colspan="3" class="right message">'+textPrompts.requestProcess.requestor+findMember(_arr[_idx].requestorId,requestors).companyName+'</th></tr>';
        _str += '<tr><th id ="o_request'+_idx+'" width="20%">'+_arr[_idx].requestNumber+'</th><th width="50%" id="o_status'+_idx+'">'+JSON.parse(_arr[_idx].status).text+'</th>'+_action+'<br/><select id="providers'+_idx+'">'+p_string+'</th>'+_button+'</tr></table>';
        _str+= '<table class="wide">'
        _str += '</table>';
    })(each, _requests);
    }

    _target.append(_str);
    for (let each in _requests)
    {(function(_idx, _arr)
      { $('#o_btn_'+_idx).on('click', function ()
        {
          let options = {};
          options.action = $('#o_action'+_idx).find(':selected').text();
          options.requestNo = $('#o_request'+_idx).text();
          options.participant = $('#owner').val();
          if ((options.action === 'Resolve') || (options.action === 'Refund')) {options.reason = $('#o_reason'+_idx).val();}
          $('#owner_messages').prepend(formatMessage(options.action+textPrompts.requestProcess.processing_msg.format(options.action, options.requestNo)+options.requestNo));
          showLoad();
          $.when($.post('/fabric/client/requestAction', options)).done(function (_results) { 
            hideLoad();
            $('#owner_messages').prepend(formatMessage(_results.result));             
           });
      });
        if (notifyMe(o_alerts, _arr[_idx].id)) {$('#o_status'+_idx).addClass('highlight'); }
    })(each, _requests);
    }
    o_alerts = new Array();
    toggleAlert($('#owner_notify'), o_alerts, o_alerts.length);
}