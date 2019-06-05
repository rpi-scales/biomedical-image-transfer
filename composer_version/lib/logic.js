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

/* global getCurrentParticipant getParticipantRegistry getFactory emit */

/**
 * A Member grants access to their record to another Member.
 * @param {org.acme.pii.AuthorizeAccess} authorize - the authorize to be processed
 * @transaction
 */
async function authorizeAccess(authorize) {  // eslint-disable-line no-unused-vars

	const me = getCurrentParticipant();
	console.log('**** AUTH: ' + me.getIdentifier() + ' granting access to ' + authorize.doctorId );

	if(!me) {
		throw new Error('A participant/certificate mapping does not exist.');
	}

	// if the member is not already authorized, we authorize them
	let index = -1;

	if(!me.doctors) {
		me.doctors = [];
	}
	else {
		index = me.doctors.indexOf(authorize.doctorId);
	}

	if(index < 0) {
		me.doctors.push(authorize.doctorId);

		// persist the state of the member
		const memberRegistry = await getParticipantRegistry('org.acme.pii.Patient');
		await memberRegistry.update(me);
	}
}

/**
 * A Member revokes access to their record from another Member.
 * @param {org.acme.pii.RevokeAccess} revoke - the RevokeAccess to be processed
 * @transaction
 */
async function revokeAccess(revoke) {  // eslint-disable-line no-unused-vars

	const me = getCurrentParticipant();
	console.log('**** REVOKE: ' + me.getIdentifier() + ' revoking access to ' + revoke.doctorId );

	if(!me) {
		throw new Error('A participant/certificate mapping does not exist.');
	}

	// if the member is authorized, we remove them
	const index = me.doctors ? me.doctors.indexOf(revoke.doctorId) : -1;

	if(index>-1) {
		me.doctors.splice(index, 1);

		// persist the state of the member
		const memberRegistry = await getParticipantRegistry('org.acme.pii.Patient');
		await memberRegistry.update(me);
	}
}

/**
 * A Member attaches a new record to another member.
 * @param {org.acme.pii.AttachRecord} attach - the attachRecord to be processed
 * @transaction
 */
async function attachRecord(attach) {  // eslint-disable-line no-unused-vars

	const me = getCurrentParticipant();
	console.log('**** AUTH: ' + me.getIdentifier() + ' attaching record with ' + attach.recordId );

	if(!me) {
		throw new Error('A participant/certificate mapping does not exist.');
	}

	// if the member is not already authorized, we authorize them
	let index = -1;

	if(!me.records) {
		me.records = [];
	}
	else {
		index = me.records.indexOf(attach.recordId);
	}

	if(index < 0) {
		me.records.push(attach.recordId);

		// persist the state of the member
		const memberRegistry = await getParticipantRegistry('org.acme.pii.Patient');
		await memberRegistry.update(me);
	}
}

/**
 * A Member detaches an record from another Member.
 * @param {org.acme.pii.DetachRecord} detach - the detachRecord to be processed
 * @transaction
 */
async function detachRecord(detach) {  // eslint-disable-line no-unused-vars

	const me = getCurrentParticipant();
	console.log('**** REVOKE: ' + me.getIdentifier() + ' detaching record with ' + detach.recordId );

	if(!me) {
		throw new Error('A participant/certificate mapping does not exist.');
	}

	// if the member is authorized, we remove them
	const index = me.records ? me.records.indexOf(detach.recordId) : -1;

	if(index>-1) {
		me.records.splice(index, 1);

		// persist the state of the member
		const memberRegistry = await getParticipantRegistry('org.acme.pii.Patient');
		await memberRegistry.update(me);
	}
}