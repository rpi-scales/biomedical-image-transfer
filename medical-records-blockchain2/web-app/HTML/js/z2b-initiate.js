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

// z2c-initiate.js

'use strict';

let connectionProfileName = 'z2b-test-profile';
let networkFile = 'zerotoblockchain-network.bna';
let businessNetwork = 'zerotoblockchain-network';

let host_address = window.location.host;

let requestors = new Array();
let owners= new Array();

let sostring;

// predefined request states
const requestStatus = {
    Created: {code: 1, text: 'Request Created'},
    Denied: {code: 2, text: 'Request Denied'},
    Granted: {code: 3, text: 'Access Granted'},
    Revoked: {code: 13, text: 'Access Revoked'}
};

/**
* standard home page initialization routine
* Refer to this by {@link initPage()}.
*/
function initPage ()
{
    // goMultiLingual() establishes what languages are available for this web app, populates the header with available languages and sets the default language to US_English
    goMultiLingual('US_English', 'index');
    // singleUX loads the members already present in the network
    memberLoad();
}
