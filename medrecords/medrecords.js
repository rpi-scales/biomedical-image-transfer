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

//id is a logical id assigned by owner (immutable)
//meta is a metadata object
//observation is an observation object
function Resource(id, meta, observation){
    this.id = id;
    this.meta = meta;
    this.observation = observation;
}

class MedRec extends Contract {

    async initLedger(ctx) {

    }

    //Returns IPFSHash of file
    //Purpose describes the requestor's reason for accessing the file
    //  See https://www.hl7.org/fhir/v3/PurposeOfUse/vs.html
    async queryRec(ctx, recNumber, requestor, purpose){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const requestorExists = await wallet.exists(requestor);
        if (!requestorExists) {
            throw new Error(`An identity for the user ${requestor} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
        

        const walletContents = await wallet.export(requestor);
        const requestorPrivateKey = walletContents.privateKey;

        const rec = JSON.parse(recAsBytes.toString());

        const filehash = rec.resource.observation.value.content;

        let outcome = 0;
        let outcomeDesc;

        if(rec.encrypted){
            outcome = 12;
            outcomeDesc = "No user has access to the file."
            console.log(outcomeDesc);
        }
        else{
            outcomeDesc = "Success. File was not encrypted."
            console.log(outcomeDesc);
            // calculate Hash from the file
            const fileLoaded = fs.readFileSync(filename, 'utf8');
            var hashToAction = CryptoJS.SHA256(fileLoaded).toString();
            console.log("Hash of the file: " + hashToAction);

            // get certificate from the certfile
            const certLoaded = fs.readFileSync(certfile, 'utf8');


            var requestorPublicKey = KEYUTIL.getKey(certLoaded);
            var recover = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
            recover.init(requestorPublicKey);
            recover.updateHex(hashToAction);
            var getBackSigValueHex = new Buffer(resultJSON.signature, 'base64').toString('hex');
            console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
            /*
            var bytes = CryptoJS.AES.decrypt(currHash.toString(), userPublicKey);
            var decryptedFile = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
     
            console.log(decryptedFile);
        */
        }
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+'T'+time;

        const type = "110114"; //Type is "User Authentication has been attempted"
        const subtype = "read"; //Read the current state of the resource
        const action = "E"; //Execute - perform a query/search operation
        const recorded = date;
        const purpose = purpose;

        //Agent type: healthcare provider, role: healthcare provider, media: film type,
        const agent = new Agent("PROV", "PROV", null, null, requestor, true, null,
            null, "110010", null, purpose);

        const newAE = new AuditEvent(type, subtype, action, recorded, outcome, 
        outcomeDesc, purpose, agent, null, null);

        rec.resource.meta.auditLog.push(newAE);
        rec.resource.meta.lastUpdated = dateTime;

        //Next step: implement AE addition when file used in IPFS

        return filehash;
    
    }

    //Encode IPFSHash w/receiver's key
    async giveAccess(ctx, recNumber, recip){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
            throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const recipExists = await wallet.exists(recip);
        if (!recipExists) {
            throw new Error(`An identity for the user ${recip} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const walletContents1 = await wallet.export(owner);
        const ownerPrivateKey = walletContents1.privateKey;


        const walletContents2 = await wallet.export(recip);
        const receiverPublicKey = walletContents2.publicKey;

        const rec = JSON.parse(recAsBytes.toString());

        var sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
        sig.init(receiverPublicKey, "");
        sig.updateHex(hashToAction);
        var sigValueHex = sig.sign();
        var sigValueBase64 = new Buffer(sigValueHex, 'hex').toString('base64');
        console.log("Signature: " + sigValueBase64);

        
        var currHash = rec.resource.observation.value;
        var bytes = CryptoJS.AES.decrypt(currHash.toString(), ownerPrivateKey);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        

        rec.resource.observation.value.content = plaintext;
        rec.encrypted = false;

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+'T'+time;

        const type = "decrypt";
        const subtype = "update"; 
        const action = "update"; 
        const recorded = date;
        const purpose = purpose;

        //Agent type: healthcare provider, role: healthcare provider, media: film type,
        const agent = new Agent("PROV", "PROV", null, null, owner, true, null,
            null, "110010", null, purpose);

        const newAE = new AuditEvent(type, subtype, action, recorded, 0, 
        `Decrypted file IPFSHash for ${recip}`, purpose, agent, null, null);

        rec.resource.meta.auditLog.push(newAE);
        rec.resource.meta.lastUpdated = dateTime;

        return rec.encrypted;
        
    }

    //Encode IPFSHash w/owner's key to abstract knowledge from receiver
    //Unable to remove 
    async revokeAccess(ctx, recNumber, owner){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
           throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;

        const rec = JSON.parse(recAsBytes.toString());

        var currHash = rec.resource.observation.value;

        if(!rec.encrypted){
            throw new Error(`${recNumber} is already hidden`);
        }

        var newHash = CryptoJS.AES.encrypt(currHash, ownerPrivateKey);

        rec.resource.observation.value = newHash;
        rec.encrypted = true;

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+'T'+time;

        const type = "encrypt";
        const subtype = "update"; 
        const action = "update"; 
        const recorded = date;
        const purpose = purpose;

        //Agent type: healthcare provider, role: healthcare provider, media: film type,
        const agent = new Agent("PROV", "PROV", null, null, owner, true, null,
            null, "110010", null, purpose);

        const newAE = new AuditEvent(type, subtype, action, recorded, 0, 
        "Encrypted file IPFSHash", purpose, agent, null, null);

        rec.resource.meta.auditLog.push(newAE);
        rec.resource.meta.lastUpdated = dateTime;

        return rec.encrypted;
    }


    //Creates a record from a given file and owner.
    async createRec(ctx, configFile) {
        console.info('============= START : Create Record ===========');

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
            throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        //Read the JSON file and assign appropriate variables;

        try {
          const jsonString = fs.readFileSync('./configrsrc.json');
          const config = JSON.parse(jsonString);
        } catch(err) {
          console.log(err);
          return
        }

    
        const resID = config.resource.id;

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

        //Encrypt the IPFSHash with the owner's key.

        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;


        var IPFSHash = CryptoJS.AES.encrypt(content, ownerPrivateKey);

        //Create a new Media object.

        const value = new Media(valID, basedOn, partOf, valStatus, valType,
            valModality, valView, valSubject, valEncounter, valCreated, valIssued,
            valOperator, valReason, valSite, valDevName, valDevice, valHeight,
            valWidth, valFrames, valDuration, content, note);

        //Create a new Observation object.

        const observation = new Observation(obID,
                status, category, effective, value);

        //Create the Resource object.

        const resource = new Resource(resID, meta, observation);

        let encrypted = true;

       
        const rec = {
            owner,
            docType: 'rec',
            resource,
            encrypted,
        };

        await ctx.stub.putState(resID, Buffer.from(JSON.stringify(rec)));
        console.info('============= END : Create Record ===========');
    }

    async listAudits(ctx, recNumber, requestor, purpose){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const requestorExists = await wallet.exists(requestor);
        if (!requestorExists) {
            throw new Error(`An identity for the user ${requestor} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
        

        const walletContents = await wallet.export(requestor);
        const requestorPrivateKey = walletContents.privateKey;

        const rec = JSON.parse(recAsBytes.toString());

        const auditEvents = rec.resource.meta.auditLog;

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
        const recorded = date;
        const purpose = purpose;

        //Agent type: healthcare provider, role: healthcare provider, media: film type,
        const agent = new Agent("PROV", "PROV", null, null, requestor, true, null,
            null, "110010", null, purpose);

        const newAE = new AuditEvent(type, subtype, action, recorded, 0, 
        "Accessed Audit Log", purpose, agent, null, null);

        rec.resource.meta.auditLog.push(newAE);
        rec.resource.meta.lastUpdated = dateTime;


    }


}

module.exports = MedRec;
