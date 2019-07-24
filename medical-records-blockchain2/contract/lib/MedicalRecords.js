/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { KJUR, KEYUTIL } = require('jsrsasign');
var CryptoJS = require('crypto-js');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const { Contract } = require('fabric-contract-api');

const util = require('util');


//start and end are date-times
//  in format YYYY,YYYY-MM, YYYY-MM-DD, or YYYY-MM-DDThh:mm:ss+zz:zz
function Period(start, end){
    this.start = start;
    this.end = end;
}

//use is the purpose of the ID - usual|official|temp|secondary|old
//type is a description of the ID - not necessary when system known
//system is a URL that represents namespace for the value
//  e.g. if value is a full URI, system is  urn:ietf:rfc:3986
//value is the portion of the ID relevant to the user
//period is the time period during which ID is/was valid
//assigner  is the org. that manages/issued the ID
function Identifier(use, type, system, value, period, assigner){
    this.use = use;
    this.type = type;
    this.system = system;
    this.value = value;
    this.period = period;
    this.assigner = assigner;
}

//ref is an absolute or relative URL to the current version of the resource
//  e.g. <reference value="Patient/034AB16" />
//  e.g.  "reference" : "http://fhir.hl7.org/svc/StructureDefinition/c8973a22-2b5b-4e76-9c66-00639c99e61b"
//type is the expected type of the current resource
//  see http://www.hl7.org/fhir/valueset-resource-types.html
//  e.g. http://hl7.org/fhir/StructureDefinition/ImagingStudy, http://hl7.org/fhir/StructureDefinition/TestReport
//id is a business identifier
//  see http://www.hl7.org/fhir/datatypes.html#Identifier
//display is plain text narrative that IDs what is being referenced
function Reference(ref, type, id, display){
    this.ref = ref;
    this.type = type;
    this.id = id;
    this.display = display;
}

//address a string that identifies the network access point of
//  the user device
//type is the type of network access point
//  see https://www.hl7.org/fhir/valueset-network-type.html
function Network(address, type){
    this.address = address;
    this.type = type;
}


//type is how the agent participated
//  see https://www.hl7.org/fhir/valueset-participation-role-type.html
//role is the agent role in the event
//  see https://www.hl7.org/fhir/valueset-security-role-type.html
//who is a reference to a practitionerrole | practitioner | 
//  organization | device | patient | relatedperson
//altId is an alternative user identity (string)
//name is a human-friendly name for the agent
//requestor is a boolean that describes whether the agent is initiator
//location describes where the event occurred
//policy is the policy that authorized the event (URI)
//media is the type of media
//  see https://www.hl7.org/fhir/valueset-dicm-405-mediatype.html
//network is the logical network loc. for application activity 
//purpose is the reason given for the agent
//  see https://www.hl7.org/fhir/v3/PurposeOfUse/vs.html
function Agent(type, role, who, altId, name, requestor, location,
        policy, media, network, purpose){
    this.type = type;
    this.role = role;
    this.who = who;
    this.altId = altId;
    this.name = name;
    this.requestor = requestor;
    this.location = location;
    this.policy = policy;
    this.media = media;
    this.network = network;
    this.purpose = purpose;
}
 


//site is a string that describes the logical source location
//  within the enterprise
//observer is a reference to the identity of source detecting the event
//  PractitionerRole | Practitioner | Organization | Device | Patient | RelatedPerson
//type is the type of source where the event originated
//  see https://www.hl7.org/fhir/valueset-audit-source-type.html
function Source(site, observer, type){
    this.site = site;
    this.observer = observer;
    this.type = type;
}

//type is the name of the property
//value is the property value (string or byte stream)
function Detail(type, value){
    this.type = type;
    this.value = value;
}

//what is a reference to a specific instance of resource
//type is the type of entity involved
//  see https://www.hl7.org/fhir/valueset-audit-entity-type.html
//role is the role of the entity
//  see https://www.hl7.org/fhir/valueset-object-role.html
//lifecycle is the stage of the entity 
//  see https://www.hl7.org/fhir/valueset-object-lifecycle-events.html
//secLabel describes the security labels on the entity
//  see https://www.hl7.org/fhir/valueset-security-labels.html
//name is a string that is a descriptor for the entity
//description is text describing the entity
//query is a byte stream of query parameters
//detail is additional information about the entity
function Entity(what, type, role, lifecycle, secLabel, name,
        description, query, detail){
    this.what = what;
    this.type = type;
    this.role = role;
    this.lifecycle = lifecycle;
    this.secLabel = secLabel;
    this.name = name;
    this.description = description;
    this.query = query;
    this.detail = detail;
}

//type is an identifier of an event
//  see https://www.hl7.org/fhir/valueset-audit-event-type.html
//subtype is a more specific identifier
//  see https://www.hl7.org/fhir/valueset-audit-event-sub-type.html
//action is the type of action performed during the event
//  see https://www.hl7.org/fhir/valueset-audit-event-action.html
//recorded is the instant when the event recorded 
//  format as YYYY-MM-DD
//outcome is whether the event succeeded or failed
//  see https://www.hl7.org/fhir/valueset-audit-event-outcome.html
//outcomeDesc is a description of the event outcome
//purpose is the purpose of the event
//  see https://www.hl7.org/fhir/v3/PurposeOfUse/vs.html
//agent is an actor involved in the event
//source is the event reporter
//entity is the data or objects used during the event
function AuditEvent(type, subtype, action, recorded, outcome, 
        outcomeDesc, purpose, agent, source, entity){
    this.type = type; 
    this.subtype = subtype;
    this.action = action;
    this.recorded = recorded;
    this.outcome = outcome;
    this.outcomeDesc = outcomeDesc;
    this.purpose = purpose;
    this.agent = agent;
    this.source = source;
    this.entity = entity;
}

//versionId is an identifier - changes each time resource changes
//lastUpdated is an instant that is changed each time it is changed
//  in format YYYY-MM-DDThh:mm:ss.sss+zz:zz e.g.  2015-02-07T13:28:17.239+02:00 
//source is a uri identifying the source system of resource
//security is a list of AuditEvents
function Metadata(versionId, lastUpdated, source){
    this.versionId = versionId;
    this.lastUpdated = lastUpdated;
    this.source = source;
    this.auditLog = auditLog;
}

//identifier is an identifier for the image
//basedOn is a reference to the procedure that caused this media to be created
//  ServiceRequest | CarePlan
//partOf a reference to the event that the media is a part of
//  see http://www.hl7.org/fhir/valueset-resource-types.html
//status is the status of the image
//  preparation | in-progress | not-done | suspended | aborted | completed | entered-in-error | unknown
//type is the classification of the media as image | video | audio
//modality is the type of acquisition equipment/process
//  see https://www.hl7.org/fhir/valueset-media-modality.html
//view is the imaging view of the media
//subject is who/what the media is a record of
//encounter is the encounter associated with media (i.e. interaction b/w patient and healthcare provider(s))
//created is the time when the media was collected
//  in the format YYYY, YYYY-MM, YYYY-MM-DD or YYYY-MM-DDThh:mm:ss+zz:zz
//issued is the instant this version was made available
//operator is a reference to the resource who generated the image
//  Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson
//reasonCode is the reason the event was performed
//  see https://www.hl7.org/fhir/valueset-procedure-reason.html
//bodySite is the observed body part
//  see https://www.hl7.org/fhir/valueset-body-site.html
//deviceName is a string describing the device/manufacturer
//device is a reference to the observing device
//  Device | DeviceMetric
//height is the height of the image in pixels
//width is the width of the image in pixels
//frames is the number of frames in the media
//duration is the length in seconds of the media
//content is a hash of the actual media
//note is a comment about the media
function Media(identifier, basedOn, partOf, status, type,
            modality, view, subject, encounter, created, issued,
            operator, reasonCode, bodySite, deviceName, device, height,
            width, frames, duration, content, note){
    this.identifier = identifier;
    this.basedOn = basedOn;
    this.partOf = partOf;
    this.status = status;
    this.type = type;
    this.modality = modality;
    this.view = view;
    this.subject = subject;
    this.encounter = encounter;
    this.created = created;
    this.issued = issued;
    this.operator = operator;
    this.reasonCode = reasonCode;
    this.bodySite = bodySite;
    this.deviceName = deviceName;
    this.device = device;
    this.height = height;
    this.width = width;
    this.frames = frames;
    this.duration = duration;
    this.content = content;
    this.note = note;
}

//id is a business identifier
//status 
//  http://www.hl7.org/fhir/codesystem-observation-status.html
//category is type of observation
//   http://www.hl7.org/fhir/valueset-observation-category.html
//effective is a structure of effectiveDateTime, Period, Timing and/or Instant of observation
//value is media that describes the result - contains hash of actual data file
//note is comment about observation
function Observation(id, category, status, effective, value){
    this.id = id;
    this.status = status;
    this.category = category;
    this.effective = effective;
    this.value = value;
}

//Resource and its internal attributes are based on the FHIR hl7 standard
//This version is created to hold 
//id is a logical id assigned by owner (immutable)
//meta is a metadata object
//observation is an observation object
function Resource(id, meta, observation){
    this.id = id;
    this.meta = meta;
    this.observation = observation;
}

// predefined request states
const requestStatus = {
    Created: {code: 1, text: 'Request Created'},
    Denied: {code: 2, text: 'Request Denied'},
    Granted: {code: 3, text: 'Access Granted'},
    Revoked: {code: 13, text: 'Access Revoked'}
};

class MedicalRecords extends Contract {

    // instantiate with keys to collect participant ids
    async instantiate(ctx) {

        let emptyList = [];
        await ctx.stub.putState('owners', Buffer.from(JSON.stringify(emptyList)));
        await ctx.stub.putState('requestors', Buffer.from(JSON.stringify(emptyList)));
    }

    // add an owner object to the blockchain state identifited by the ownerId
    async RegisterOwner(ctx, ownerId, companyName) {

        let owner = {
            id: ownerId,
            companyName: companyName,
            type: 'owner',
            requests: []
            records: []
        };
        await ctx.stub.putState(ownerId, Buffer.from(JSON.stringify(owner)));

        //add buyerId to 'buyers' key
        let data = await ctx.stub.getState('owners');
        if (data) {
            let owners = JSON.parse(data.toString());
            owners.push(ownerId);
            await ctx.stub.putState('owners', Buffer.from(JSON.stringify(owners)));
        } else {
            throw new Error('owners not found');
        }

        // return owner object
        return JSON.stringify(owner);
    }

    // add a requestor object to the blockchain state identifited by the requestorId
    async RegisterRequestor(ctx, requestorId, companyName) {

        let requestor = {
            id: requestorId,
            companyName: companyName,
            type: 'requestor',
            requests: []
            records: []
        };
        await ctx.stub.putState(requestorId, Buffer.from(JSON.stringify(requestor)));

        //add buyerId to 'buyers' key
        let data = await ctx.stub.getState('requestors');
        if (data) {
            let requestors = JSON.parse(data.toString());
            requestors.push(requestorId);
            await ctx.stub.putState('requestors', Buffer.from(JSON.stringify(requestors)));
        } else {
            throw new Error('requestors not found');
        }

        // return requestor object
        return JSON.stringify(requestor);
    }


     // add a request object to the blockchain state identifited by the requestNumber
    async CreateRequest(ctx, requestorId, ownerId, requestNumber, recordId) {

        // verify requestorId
        let requestorData = await ctx.stub.getState(requestorId);
        let requestor;
        if (requestorData) {
            requestor = JSON.parse(requestorData.toString());
            if (requestor.type !== 'requestor') {
                throw new Error('requestor not identified');
            }
        } else {
            throw new Error('requestor not found');
        }

        // verify ownerId
        let ownerData = await ctx.stub.getState(ownerId);
        let owner;
        if (ownerData) {
            owner = JSON.parse(ownerData.toString());
            if (owner.type !== 'owner') {
                throw new Error('owner not identified');
            }
        } else {
            throw new Error('owner not found');
        }

        let request = {
            requestNumber: requestNumber,
            status: JSON.stringify(requestStatus.Created),
            requestorId: requestorId,
            ownerId: ownerId,
            recordId: recordId
        };

        //add request to requestor
        requestor.requests.push(requestNumber);
        await ctx.stub.putState(requestorId, Buffer.from(JSON.stringify(requestor)));

        //store request identified by requestNumber
        await ctx.stub.putState(requestNumber, Buffer.from(JSON.stringify(request)));

        return JSON.stringify(request);
    }

    async RequestDeny(ctx, requestNumber, requestorId, ownerId) {

        // get request json
        let data = await ctx.stub.getState(requestNumber);
        let request;
        if (data) {
            request = JSON.parse(data.toString());
        } else {
            throw new Error('request not found');
        }

        // verify requestorId
        let requestorData = await ctx.stub.getState(requestorId);
        let requestor;
        if (requestorData) {
            requestor = JSON.parse(requestorData.toString());
            if (requestor.type !== 'requestor') {
                throw new Error('requestor not identified');
            }
        } else {
            throw new Error('requestor not found');
        }

        // verify sellerId
        let ownerData = await ctx.stub.getState(ownerId);
        let owner;
        if (ownerData) {
            owner = JSON.parse(ownerData.toString());
            if (owner.type !== 'owner') {
                throw new Error('owner not identified');
            }
        } else {
            throw new Error('owner not found');
        }

        int outcome = 0;

        //update request
        if (request.status == JSON.stringify(requestStatus.Created)) {
            request.status = JSON.stringify(requestStatus.Denied);
            await ctx.stub.putState(requestNumber, Buffer.from(JSON.stringify(request)));
            return JSON.stringify(request);
        } else {
            throw new Error('request not created');
            outcome = 12;
        }
        addAudit(requestor.records[i], 110113, null, "E", outcome, `Denied Request of requestor ${requestorId}`,
                "TREAT", owner, null, null);
    }

    async AccessGrant(ctx, requestNumber, requestorId, ownerId) {

        // get request json
        let data = await ctx.stub.getState(requestNumber);
        let request;
        if (data) {
            request = JSON.parse(data.toString());
        } else {
            throw new Error('request not found');
        }

        // verify requestorId
        let requestorData = await ctx.stub.getState(requestorId);
        let requestor;
        if (requestorData) {
            requestor = JSON.parse(requestorData.toString());
            if (requestor.type !== 'requestor') {
                throw new Error('requestor not identified');
            }
        } else {
            throw new Error('requestor not found');
        }

        // verify sellerId
        let ownerData = await ctx.stub.getState(ownerId);
        let owner;
        if (ownerData) {
            owner = JSON.parse(ownerData.toString());
            if (owner.type !== 'owner') {
                throw new Error('owner not identified');
            }
        } else {
            throw new Error('owner not found');
        }

        int outcome = 0;

        //update request
        if (request.status == JSON.stringify(requestStatus.Created) ) {
            request.status = JSON.stringify(requestStatus.Granted);
            for(var i = 0; i < owner.records.length; i++){
                if(owner.records[i].recordId == request.recordId){
                    requestor.records.push(owner.records[i]);
                    break;
                }
            }
            await ctx.stub.putState(requestNumber, Buffer.from(JSON.stringify(request)));
            return JSON.stringify(request);
        } else {
            throw new Error('request not created');
            outcome = 12;
        }
        addAudit(requestor.records[i], "decrypt", 110137, "E", outcome, `Granted Access of requestor ${requestorId}`,
                "TREAT", owner, null, null);
    }

    async AccessRevoke(ctx, requestNumber, requestorId, ownerId) {

        // get request json
        let data = await ctx.stub.getState(requestNumber);
        let request;
        if (data) {
            request = JSON.parse(data.toString());
        } else {
            throw new Error('request not found');
        }

        // verify requestorId
        let requestorData = await ctx.stub.getState(requestorId);
        let requestor;
        if (requestorData) {
            requestor = JSON.parse(requestorData.toString());
            if (requestor.type !== 'requestor') {
                throw new Error('requestor not identified');
            }
        } else {
            throw new Error('requestor not found');
        }

        // verify sellerId
        let ownerData = await ctx.stub.getState(ownerId);
        let owner;
        if (ownerData) {
            owner = JSON.parse(ownerData.toString());
            if (owner.type !== 'owner') {
                throw new Error('owner not identified');
            }
        } else {
            throw new Error('owner not found');
        }

        int outcome = 0;

        //update request
        if (request.status == JSON.stringify(requestStatus.Created) || request.status == JSON.stringify(requestStatus.Granted) ) {
            request.status = JSON.stringify(requestStatus.Revoked);
            for(var i = 0; i < requestor.records.length; i++){
                if(requestor.records[i].recordId == request.recordId){
                    requestor.records.splice(i,1);
                    break;
                }
            }

            await ctx.stub.putState(requestNumber, Buffer.from(JSON.stringify(request)));
            return JSON.stringify(request);
        } else {
            throw new Error('request not created');
            outcome = 12;
        }
        addAudit(requestor.records[i], "encrypt", 110137, "E", outcome, `Revoked Access of requestor ${requestorId}`,
                "TREAT", owner, null, null);
    }

    //Creates a record from a given file and owner.
    async createRec(ctx, ownerId, configFile) {
        
        let ownerData = await ctx.stub.getState(ownerId);
        let owner;
        if (ownerData) {
            owner = JSON.parse(ownerData.toString());
            if (owner.type !== 'owner') {
                throw new Error('owner not identified');
            }
        } else {
            throw new Error('owner not found');
        }

        //Read the JSON file and assign appropriate variables;

        
        try {
          const jsonString = fs.readFileSync('./configrsrc.json');
          const config = JSON.parse(jsonString);
        } catch(err) {
          console.log(err);
          return
        }

    
        const recordId = config.resource.id;

        //Metadata VersionID

        const use = config.resource.meta.versionId.use;
        const verType = config.resource.meta.versionId.type;
        const verSystem = config.resource.meta.versionId.system;
        const verVal = config.resource.meta.versionId.value;

        const start = config.resource.meta.versionId.period.start;
        const end = config.resource.meta.versionId.period.end;

        const period = new Period(start,end);

        const assignRef = config.resource.meta.versionId.assigner.reference;
        const assignID = config.resource.meta.versionId.assigner.id;
        const assignType = config.resource.meta.versionId.assigner.type;
        const assignDisp = config.resource.meta.versionId.assigner.display;

         const assigner = new Reference(assignRef, assignID, assignType, assignDisp);

        const lastUpdated = config.resource.meta.lastUpdated;
        const metaSource = config.resource.meta.source;

        const versionID = new Identifier(use, verType, verSystem, verVal,
                    period, assigner);

        //AuditEvent Parsing

        const aeType = config.resource.meta.auditLog.type;
        const aeSubtype = config.resource.meta.auditLog.subtype;
        const aeAction = config.resource.meta.auditLog.action;
        const aeRecorded = config.resource.meta.auditLog.recorded;
        const aeOutcome = config.resource.meta.auditLog.outcome;
        const aeOutcomeDesc = config.resource.meta.auditLog.outcomeDesc;
        const aePurpose = config.resource.meta.auditLog.purpose;
        const aeAgentType = config.resource.meta.auditLog.agent.type;
        const aeAgentRole = config.resource.meta.auditLog.agent.role;
       
        const aeAgentWhoRef = config.resource.meta.auditLog.agent.who.reference;
        const aeAgentWhoID = config.resource.meta.auditLog.agent.who.id;
        const aeAgentWhoType = config.resource.meta.auditLog.agent.who.type;
        const aeAgentWhoDisplay = config.resource.meta.auditLog.agent.who.display;
        
        const aeAgentWho = new Reference(aeAgentWhoRef, aeAgentWhoID, aeAgentWhoType,
                aeAgentWhoDisplay);

        const aeAgentAltID = config.resource.meta.auditLog.agent.altId;
        const aeAgentName = config.resource.meta.auditLog.agent.name;
        const aeAgentRequestor = config.resource.meta.auditLog.agent.requestor;
        
        const aeAgentLocRef = config.resource.meta.auditLog.agent.location.reference;
        const aeAgentLocID = config.resource.meta.auditLog.agent.location.id;
        const aeAgentLocType = config.resource.meta.auditLog.agent.location.type;
        const aeAgentLocDisplay = config.resource.meta.auditLog.agent.location.display;
        
        const aeAgentLoc = new Reference(aeAgentLocRef, aeAgentLocID, aeAgentLocType,
                aeAgentLocDisplay);

        const aeAgentPolicy = config.resource.meta.auditLog.agent.policy;
        const aeAgentMedia = config.resource.meta.auditLog.agent.media;
        
        const aeAgentNetworkAddr = config.resource.meta.auditLog.agent.network.address;
        const aeAgentNetworkType = config.resource.meta.auditLog.agent.network.type;
        
        const aeAgentNetwork = new Network(aeAgentNetworkAddr, aeAgentNetworkType);

        const aeAgentPurpose = config.resource.meta.auditLog.agent.purpose;
        
        const aeAgent = new Agent(aeAgentType, aeAgentRole, aeAgentWho, aeAgentAltID,
                aeAgentName, aeAgentRequestor, aeAgentLoc, aeAgentPolicy, aeAgentMedia,
                aeAgentNetwork, aeAgentPurpose);

        const aeSourceSite = config.resource.meta.auditLog.source.site;
        const aeSourceObser = config.resource.meta.auditLog.source.observer;
        const aeSourceType = config.resource.meta.auditLog.source.type;
        
        const aeSource = new Source(aeSourceSite, aeSourceObser, aeSourceObser);

        const aeEntityWhatRef = config.resource.meta.auditLog.entity.what.reference;
        const aeEntityWhatID = config.resource.meta.auditLog.entity.what.id;
        const aeEntityWhatType = config.resource.meta.auditLog.entity.what.type;
        const aeEntityWhatDisplay = config.resource.meta.auditLog.entity.what.display;
       
        const aeEntityWhat = new Reference(aeEntityWhatRef, aeEntityWhatID, aeEntityWhatType,
                    aeEntityWhatDisplay);

        const aeEntityType = config.resource.meta.auditLog.entity.type;
        const aeEntityRole = config.resource.meta.auditLog.entity.role;
        const aeEntityLifecycle = config.resource.meta.auditLog.entity.lifecycle;
        const aeEntitySec = config.resource.meta.auditLog.entity.secLabel;
        const aeEntityName = config.resource.meta.auditLog.entity.name;
        const aeEntityDesc = config.resource.meta.auditLog.entity.description;
        const aeEntityQuery = config.resource.meta.auditLog.entity.query;
        
        const aeEntityDetailType = config.resource.meta.auditLog.entity.detail.type;
        const aeEntityDetailVal = config.resource.meta.auditLog.entity.detail.val;

        const aeEntityDetail = new Detail(aeEntityDetailType, aeEntityDetailVal);

        const aeEntity = new Entity(aeEntityWhat, aeEntityType, aeEntityRole, aeEntityLifecycle,
                aeEntitySec, aeEntityName, aeEntityDesc, aeEntityQuery, aeEntityDetail);

        const auditLog = new AuditEvent(aeType, aeSubtype, aeAction,
                aeRecorded, aeOutcome, aeOutcomeDesc, aePurpose, aeAgent, aeSource,
                aeEntity);

        //Create an array to hold multiple Audit Events

        var auditEvents = new Array(auditLog);

        //Create the Metadata Object

        const meta = new Metadata(versionID, lastUpdated, metaSource, auditEvents);

        //Observation parsing

        const obID = config.resource.observation.id;
        const status = config.resource.observation.status;
        const category = config.resource.observation.category;
        const effective = config.resource.observation.effective;

        //Media parsing

        const valIDUse = config.resource.observation.value.identifier.use;
        const valIDType = config.resource.observation.value.identifier.type;
        const valIDSystem = config.resource.observation.value.identifier.system;
        const valIDValue = config.resource.observation.value.identifier.value;
        const valIDPeriodStart = config.resource.observation.value.identifier.period.start;
        const valIDPeriodEnd = config.resource.observation.value.identifier.period.end;
        const valIDPeriod = new Period(valIDPeriodStart, valIDPeriodEnd);
        const valIDAssigner = config.resource.observation.value.identifier.assigner;

        const valID = new Identifier(valIDUse, valIDType, valIDSystem, 
                valIDValue, valIDPeriod, valIDAssigner);

        const basedOnRef = config.resource.observation.value.basedOn.reference;
        const basedOnID = config.resource.observation.value.basedOn.id;
        const basedOnType =  config.resource.observation.value.basedOn.type;
        const basedOnDisplay = config.resource.observation.value.basedOn.display;

        const basedOn = new Reference(basedOnRef, basedOnID, basedOnType, basedOnDisplay);

        const partOfRef = config.resource.observation.value.partOf.reference;
        const partOfID = config.resource.observation.value.partOf.id;
        const partOfType =  config.resource.observation.value.partOf.type;
        const partOfDisplay = config.resource.observation.value.partOf.display;

        const partOf = new Reference(partOfRef, partOfID, partOfType, partOfDisplay);

        const valStatus = config.resource.observation.value.status;
        const valType = config.resource.observation.value.type;
        const valModality = config.resource.observation.value.modality;
        const valView = config.resource.observation.value.view;

        const valSubjRef = config.resource.observation.value.subject.reference;
        const valSubjID = config.resource.observation.value.subject.id;
        const valSubjType = config.resource.observation.value.subject.type;
        const valSubjDisplay = config.resource.observation.value.subject.display;

        const valSubject = new Reference(valSubjRef, valSubjID, valSubjType, valSubjDisplay);

        const valEncRef = config.resource.observation.value.encounter.reference;
        const valEncID = config.resource.observation.value.encounter.id;
        const valEncType = config.resource.observation.value.encounter.type;
        const valEncDisplay = config.resource.observation.value.encounter.display;
        
        const valEncounter = new Reference(valEncRef, valEncID, valEncType, valEncDisplay);

        const valCreated = config.resource.observation.value.created;
        const valIssued = config.resource.observation.value.issued;

        const valOperRef = config.resource.observation.value.operator.reference;
        const valOperID = config.resource.observation.value.operator.id;
        const valOperType = config.resource.observation.value.operator.type;
        const valOperDisplay = config.resource.observation.value.operator.display;

        const valOperator = new Reference(valOperRef, valOperID, valOperType, valOperDisplay);

        const valReason = config.resource.observation.value.reasonCode;
        const valSite = config.resource.observation.value.bodySite;
        const valDevName = config.resource.observation.value.deviceName;

        const valDevRef = config.resource.observation.value.device.reference;
        const valDevID = config.resource.observation.value.device.id;
        const valDevType = config.resource.observation.value.device.type;
        const valDevDisplay = config.resource.observation.value.device.display;
        
        const valDevice = new Reference(valDevRef, valDevID, valDevType, valDevDisplay);

        const valHeight = config.resource.observation.value.height;
        const valWidth = config.resource.observation.value.width;
        const valFrames = config.resource.observation.value.frames;
        const valDuration = config.resource.observation.value.duration;


        const note = config.resource.observation.value.note;

        const content = config.resource.observation.value.content;

        const value = new Media(valID, basedOn, partOf, valStatus, valType,
            valModality, valView, valSubject, valEncounter, valCreated, valIssued,
            valOperator, valReason, valSite, valDevName, valDevice, valHeight,
            valWidth, valFrames, valDuration, content, note);

        //Create a new Observation object.

        const observation = new Observation(obID,
                status, category, effective, value);

        //Create the Resource object.

        const resource = new Resource(recordId, meta, observation);

        let encrypted = true;

       
        const record = {
            recordId: recordId,
            owner: owner,
            resource: resource,
            encrypted: encrypted,
        };


        owner.records.push(recordId);
        await ctx.stub.putState(ownerId, Buffer.from(JSON.stringify(owner)));

        await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));

        return JSON.stringify(record);
    }

    async addAudit(ctx, record, auditType, auditSubtype, auditAction, 
            auditOutcome, auditOutcomeDesc, auditPurpose, auditAgent, auditSource,
            auditEntity){


        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+'T'+time;

        const recorded = dateTime;

        const agent = new Agent("PROV", "PROV", auditAgent.ownerId, null, null, false, null,
            null, "110010", null, auditPurpose);

        const newAE = new AuditEvent(auditType, auditSubtype, auditAction, recorded, auditOutcome, 
        auditOutcomeDesc, auditPurpose, agent, auditSource, auditEntity);

    }

   
    async listAudits(ctx, requestId, participantId){
        // get request json
        let data = await ctx.stub.getState(requestNumber);
        let request;
        if (data) {
            request = JSON.parse(data.toString());
        } else {
            throw new Error('request not found');
        }

        let participantData = await ctx.stub.getState(participantId);
        let participant;
        if (participantData) {
            participant = JSON.parse(participantData.toString());
        } else {
            throw new Error('participant not found');
        }

        var record;

        var found = false;

        for(var i = 0; i < participant.records.length; i++){
            if(participant.records[i].recordId == request.recordId){
                record = participant.records[i];
                found = true;
                break;
            }
        }

        if(!found){
            throw new Error('record not found');
        }

        const recordString = JSON.parse(record.toString());

        const auditEvents = recordString.resource.meta.auditLog;

        for(let i = 0; i < auditEvents.length; i++){
            console.log(`Audit Event ${i+1}:`);
            console.log(`   Type: ${auditEvents[i].type}`);
            console.log(`   Subtype: ${auditEvents[i].subtype}`);
            console.log(`   Action: ${auditEvents[i].action}`);
            console.log(`   Recorded: ${auditEvents[i].recorded}`);
            console.log(`   Outcome: ${auditEvents[i].outcome}`);
            console.log(`   Outcome Description: ${auditEvents[i].outcomeDesc}`);
            console.log(`   Purpose: ${auditEvents[i].purpose}`);
            console.log(`   Agent: ${auditEvents[i].agent.who.id}`);
            console.log(`   Source: ${auditEvents[i].source.site}`);
            console.log(`   Entity: ${auditEvents[i].entity.name}`);

        }

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+'T'+time;

        const type = "110101";  //Audit Log Used
        const subtype = "history"; //Read the current state of the resource
        const action = "R"; //Execute - perform a query/search operation
        const recorded = dateTime;
        const purpose = purpose;

        //Agent type: healthcare provider, role: healthcare provider, media: film type,
        const agent = new Agent("PROV", "PROV", null, null, requestor, true, null,
            null, "110010", null, purpose);

        const newAE = new AuditEvent(type, subtype, action, recorded, 0, 
        "Accessed Audit Log", purpose, agent, null, null);

        recordString.resource.meta.auditLog.push(newAE);
        recordString.resource.meta.lastUpdated = dateTime;


    }


};


module.exports = MedicalRecords;
