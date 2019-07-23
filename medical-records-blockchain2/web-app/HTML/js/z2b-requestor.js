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
let r_notify = '#requestor_notify';
let r_count = '#requestor_count';
let r_id = '';
let r_alerts;

let requestDiv = 'requestDiv';

/**
 * load the requestor User Experience
 */
function loadRequestorUX ()
{   
    // get the html page to load
    let toLoad = 'requestor.html';
    // if (requestors.length === 0) then autoLoad() was not successfully run before this web app starts, so the sie of the requestor list is zero
    // assume user has run autoLoad and rebuild member list
    // if autoLoad not yet run, then member list length will still be zero
    if ((typeof(requestors) === 'undefined') || (requestors === null) || (requestors.length === 0))
    { $.when($.get(toLoad), deferredMemberLoad()).done(function (page, res)
        {setupRequestor(page);});
        }
        else{
            $.when($.get(toLoad)).done(function (page)
            {setupRequestor(page);});
        }
}


function loadRequestorUXFull ()
{
    // get the html page to load
    let toLoad = 'requestor.html';
    // if (requestors.length === 0) then autoLoad() was not successfully run before this web app starts, so the sie of the requestor list is zero
    // assume user has run autoLoad and rebuild member list
    // if autoLoad not yet run, then member list length will still be zero
    if ((typeof(requestors) === 'undefined') || (requestors === null) || (requestors.length === 0))
    { $.when($.get(toLoad), deferredMemberLoad()).done(function (page, res)
        {setupRequestorFull(page);});
        }
        else{
            $.when($.get(toLoad)).done(function (page)
            {setupRequestorFull(page);});
        }
}
   
function setupRequestor(page)
{
    // empty the hetml element that will hold this page
    $('#requestorbody').empty();
    $('#requestorbody').append(page);
    // empty the requestor alerts array
    r_alerts = [];
    // if there are no alerts, then remove the 'on' class and add the 'off' class
    if (r_alerts.length === 0)
    {$(r_notify).removeClass('on'); $(r_notify).addClass('off'); }
    else {$(r_notify).removeClass('off'); $(r_notify).addClass('on'); }
      // update the text on the page using the prompt data for the selected language
    updatePage('requestor');
    // enable the buttons to process an onClick event
    let _create = $('#newRequest');
    let _list = $('#requestStatus');
    let _requestDiv = $('#'+requestDiv);
    _create.on('click', function(){displayRequestForm();});
    _list.on('click', function(){listRequests();});
    $('#requestor').empty();
    // build the buer select HTML element
    for (let each in requestors)
    {(function(_idx, _arr)
        {$('#requestor').append('<option value="'+_arr[_idx].id+'">' +_arr[_idx].id+'</option>');})(each, requestors);
    }
    // display the name of the current requestor
    $('#company')[0].innerText = requestors[0].companyName;
    // save the current requestor id as r_id
    r_id = requestors[0].id;
    // subscribe to events
    z2bSubscribe('Requestor', r_id);
      // create a function to execute when the user selects a different requestor
    $('#requestor').on('change', function() 
    { _requestDiv.empty(); $('#requestor_messages').empty(); 
        $('#company')[0].innerText = findMember($('#requestor').find(':selected').text(),requestors).companyName; 
        // unsubscribe the current requestor
        z2bUnSubscribe(r_id);
        // get the new requestor id
        r_id = findMember($('#requestor').find(':selected').text(),requestors).id;
        // subscribe the new requestor
        z2bSubscribe('Requestor', r_id);
    });

}


function setupRequestorFull(page)
{
    // empty the hetml element that will hold this page
    $('#body').empty();
    $('#body').append(page);
    // empty the requestor alerts array
    r_alerts = [];
    // if there are no alerts, then remove the 'on' class and add the 'off' class
    if (r_alerts.length === 0)
    {$(r_notify).removeClass('on'); $(r_notify).addClass('off'); }
    else {$(r_notify).removeClass('off'); $(r_notify).addClass('on'); }
      // update the text on the page using the prompt data for the selected language
    updatePage('requestor');
    // enable the buttons to process an onClick event
    let _create = $('#newRequest');
    let _list = $('#requestStatus');
    let _requestDiv = $('#'+requestDiv);
    _create.on('click', function(){displayRequestForm();});
    _list.on('click', function(){listRequests();});
    $('#requestor').empty();
    // build the buer select HTML element
    for (let each in requestors)
    {(function(_idx, _arr)
        {$('#requestor').append('<option value="'+_arr[_idx].id+'">' +_arr[_idx].id+'</option>');})(each, requestors);
    }
    // display the name of the current requestor
    var _loc = $('#company')
    $('#company')[0].innerText = requestors[0].companyName;
    // save the current requestor id as r_id
    r_id = requestors[0].id;
    // subscribe to events
    z2bSubscribe('Requestor', r_id);
      // create a function to execute when the user selects a different requestor
    $('#requestor').on('change', function() 
    { _requestDiv.empty(); $('#requestor_messages').empty(); 
        $('#company')[0].innerText = findMember($('#requestor').find(':selected').text(),requestors).companyName; 
        // unsubscribe the current requestor
        z2bUnSubscribe(r_id);
        // get the new requestor id
        r_id = findMember($('#requestor').find(':selected').text(),requestors).id;
        // subscribe the new requestor
        z2bSubscribe('Requestor', r_id);
    });

}

/**
 * Displays the create request form for the selected requestor
 */
function displayRequestForm()
{  let toLoad = 'createRequest.html';

    // get the request creation web page and also get all of the items that a user can select
    showLoad();
    $.when($.get(toLoad)).done(function (page, _items)
    {
        hideLoad();
        
        let _requestDiv = $('#'+requestDiv);
        _requestDiv.empty();
        _requestDiv.append(page[0]);
        // update the page with the appropriate text for the selected language
        updatePage('createRequest');
        $('#owner').empty();
        // populate the owner HTML select object. This string was built during the memberLoad or deferredMemberLoad function call
        $('#owner').append(s_string);
        $('#owner').val($('#owner option:first').val());
        $('#requestNo').append('xxx');
        $('#status').append('New Request');
        // build a select list for the items

        // hide the submit new request function until an item has been selected
        $('#submitNewRequest').hide();
        $('#submitNewRequest').on('click', function ()
            { let options = {};
            options.requestor = $('#requestor').find(':selected').val();
            options.owner = $('#owner').find(':selected').val();
            console.log(options);
            _requestDiv.empty(); _requestDiv.append(formatMessage(textPrompts.requestProcess.create_msg));
            showLoad();
            $.when($.post('/fabric/client/addRequest', options)).done(function(_res) {
                hideLoad();    
                _requestDiv.empty(); _requestDiv.append(formatMessage(_res.result)); console.log(_res);
            });
        });
    });
}
/**
 * lists all requests for the selected requestor
 */
function listRequests()
{
    let options = {};
    // get the users email address
    options.id = $('#requestor').find(':selected').text();
    // get their password from the server. This is clearly not something we would do in production, but enables us to demo more easily
    // $.when($.post('/fabric/admin/getSecret', options)).done(function(_mem)
    // {
    // get their requests
    options.userID = options.id;
    // options.userID = _mem.userID; options.secret = _mem.secret;
    showLoad();
    $.when($.post('/fabric/client/getMyRequests', options)).done(function(_results)
    {
        hideLoad();
        if ((typeof(_results.requests) === 'undefined') || (_results.requests === null))
        {console.log('error getting requests: ', _results);}
        else
        {// if they have no requests, then display a message to that effect
            if (_results.requests.length < 1) {$('#requestDiv').empty(); $('#requestDiv').append(formatMessage(textPrompts.requestProcess.r_no_request_msg+options.id));}
        // if they have requests, format and display the requests.
            else{formatRequests($('#requestDiv'), _results.requests);}
        }
    });
    // });
}

/**
 * used by the listRequests() function
 * formats the requests for a requestor. requests to be formatted are provided in the _requests array
 * output replaces the current contents of the html element identified by _target
 * @param {String} _target - string with div id prefaced by #
 * @param {Array} _requests - array with request objects
 */
function formatRequests(_target, _requests)
{
    _target.empty();
    console.log('_requests:');
    console.log(_requests);

    let _str = ''; let _date = '';
    for (let each in _requests)
    {(function(_idx, _arr)
      {let _action = '<th><select id=r_action'+_idx+'><option value="'+textPrompts.requestProcess.NoAction.select+'">'+textPrompts.requestProcess.NoAction.message+'</option>';
        let r_string;
        r_string = '</th>';
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
        case requestStatus.Created.code:
            //_date = _arr[_idx].created;
            _action += '<option value="'+textPrompts.requestProcess.Purchase.select+'">'+textPrompts.requestProcess.Purchase.message+'</option>'
            _action += '<option value="'+textPrompts.requestProcess.Cancel.select+'">'+textPrompts.requestProcess.Cancel.message+'</option>'
            break;
        case requestStatus.Granted.code:
            _action += '<option value="'+textPrompts.requestProcess.Grant.select+'">'+textPrompts.requestProcess.Grant.message+'</option>'
            break;
        case requestStatus.Revoked.code:
            //_date = _arr[_idx].requestShipment;
            break;
        case requestStatus.Denied.code:
            //_date = _arr[_idx].approved;
            break;
        default:
            break;
        }
        let _button = '<th><button id="r_btn_'+_idx+'">'+textPrompts.requestProcess.ex_button+'</button></th>';
        _action += '</select>';
        if (_idx > 0) {_str += '<div class="spacer"></div>';}
        _str += '<table class="wide"><tr><th>'+textPrompts.requestProcess.requestno+'</th><th>'+textPrompts.requestProcess.status+'</th><th colspan="3" class="right message">'+textPrompts.requestProcess.owner+findMember(_arr[_idx].ownerId,owners).companyName+'</th></tr>';
        _str += '<tr><th id ="r_request'+_idx+'" width="20%">'+_arr[_idx].requestNumber+'</th><th width="50%" id="r_status'+_idx+'">'+JSON.parse(_arr[_idx].status).text+'</th><th class="right">$'+_arr[_idx].amount+'.00</th>'+_action+r_string+_button+'</tr></table>';
        _str+= '<table class="wide">'
    
        _str += '</table>';
    })(each, _requests);
    }
    // append the newly built request table to the web page
    //console.log('_str');
    //console.log(_str);
    _target.append(_str);
    //
    // now that the page has been placed into the browser, all of the id tags created in the previous routine can now be referenced.
    // iterate through the page and make all of the different parts of the page active.
    //
    for (let each in _requests)
        {(function(_idx, _arr)
            { $('#r_btn_'+_idx).on('click', function ()
                {
                let options = {};
                options.action = $('#r_action'+_idx).find(':selected').text();
                options.requestNo = $('#r_request'+_idx).text();
                options.participant = $('#requestor').val();
                if ((options.action === 'Dispute') || (options.action === 'Resolve'))
                {options.reason = $('#r_reason'+_idx).val();}
                $('#requestor_messages').prepend(formatMessage(options.action+textPrompts.requestProcess.processing_msg.format(options.action, options.requestNo)+options.requestNo));
                showLoad();
                $.when($.post('/fabric/client/requestAction', options)).done(function (_results)
                { 
                    hideLoad();
                    $('#requestor_messages').prepend(formatMessage(_results.result)); 
                });
            });
            // use the notifyMe function to determine if this request is in the alert array. 
            // if it is, the highlight the $('#r_status'+_idx) html element by adding the 'highlight' class
            if (notifyMe(r_alerts, _arr[_idx].id)) {$('#r_status'+_idx).addClass('highlight'); }
        })(each, _requests);
    }
    // reset the r_alerts array to a new array
    r_alerts = new Array();
    // call the toggleAlerts function to reset the alert icon
    toggleAlert($('#requestor_notify'), r_alerts, r_alerts.length);
}