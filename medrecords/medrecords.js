/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { KJUR, KEYUTIL } = require('jsrsasign');
var CryptoJS = require('crypto-js');

const { FileSystemWallet, Gateway } = require('fabric-network');
const yaml = require('js-yaml');
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

//versionId is an identifier - changes each time resource changes
//lastUpdated is an instant that is changed each time it is changed
//  in format YYYY-MM-DDThh:mm:ss.sss+zz:zz e.g.  2015-02-07T13:28:17.239+02:00 
//source is a uri identifying the source system of resource
//don't really understand profile, security or tag
function Metadata(versionId, lastUpdated, source){
    this.versionId = versionId;
    this.lastUpdated = lastUpdated;
    this.source = source;
    //this.profile = profile;
    //this.security = security;
    //this.tag = tag;
}

//id is a business identifier
//basedOn is a reference object that describes source of observation
//  e.g. DeviceRequest, ServiceRequest, MedicationRequest, ImmunizationRecommendation
//partOf is a reference object that describes event
//  e.g. MedicationAdministration, Procedure, Immunization, ImagingStudy   
//status 
//  http://www.hl7.org/fhir/codesystem-observation-status.html
//category is type of observation
//   http://www.hl7.org/fhir/valueset-observation-category.html
//subject is a reference to a patient | group | device | location which the observation is about
//effective is a structure of effectiveDateTime, Period, Timing and/or Instant of observation
//issued is instant the version made available
//performer is reference to practitioner | Patient | Org | Team responsible for observation
//value is struct (?) that describes the result - contains hash of actual data file
//note is comment about observation
function Observation(id, basedOn, partOf, status, category,
        subject, effective, issued, performer, value, note){
    this.id = id;
    this.basedOn = basedOn;
    this.partOf = partOf;
    this.status = status;
    this.category = category;
    this.subject = subject;
    this.effective = effective;
    this.issued = issued;
    this.performer = performer;
    this.value = value;
    this.note = note;
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
        console.info('============= START : Initialize Ledger ===========');
        const recs = [
            {
                owner: 'Albany Medical Center',
                resource: ,
                encrypted: true,
                
            },
            {
                owner: 'Boston Children\'s Hospital',
                resource: ,
                encrypted: true,
            },
        ];

        for (let i = 0; i < recs.length; i++) {
            recs[i].docType = 'rec';
            await ctx.stub.putState('REC' + i, Buffer.from(JSON.stringify(recs[i])));
            console.info('Added <--> ', recs[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //Returns IPFSHash of file
    async requestRec(ctx, recNumber, requester){
        const recAsBytes = await ctx.stub.getState(recNumber); // get the record from chaincode state
        if (!recAsBytes || recAsBytes.length === 0) {
            throw new Error(`${recNumber} does not exist`);
        }
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const requesterExists = await wallet.exists(requester);
        if (!requesterExists) {
            throw new Error(`An identity for the user ${requester} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
        

        const walletContents = await wallet.export(requester);
        const requesterPrivateKey = walletContents.privateKey;

        const rec = JSON.parse(recAsBytes.toString());

        const filehash = rec.resource.observation.value;

        if(rec.encrypted){
            throw new Error(`${filename} is not accessable!`)
        }

        // calculate Hash from the file
        const fileLoaded = fs.readFileSync(filename, 'utf8');
        var hashToAction = CryptoJS.SHA256(fileLoaded).toString();
        console.log("Hash of the file: " + hashToAction);

        // get certificate from the certfile
        const certLoaded = fs.readFileSync(certfile, 'utf8');


        var requesterPublicKey = KEYUTIL.getKey(certLoaded);
        var recover = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
        recover.init(requesterPublicKey);
        recover.updateHex(hashToAction);
        var getBackSigValueHex = new Buffer(resultJSON.signature, 'base64').toString('hex');
        console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
        /*
        var bytes = CryptoJS.AES.decrypt(currHash.toString(), userPublicKey);
        var decryptedFile = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
 
        console.log(decryptedFile);
        */

        return filehash;
    
    }

    //Encode IPFSHash w/receiver's key
    async giveAccess(ctx, recNumber, owner, recip){
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
        

        rec.resource.observation.value = plaintext;
        rec.encrypted = false;

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
        /*
        const recipExists = await wallet.exists(recip);
        if (!recipExists) {
            throw new Error(`An identity for the user ${recip} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }
    */
        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;

        /*
        const walletContents = await wallet.export(recip);
        const receiverPublicKey = walletContents.publicKey;
*/
        const rec = JSON.parse(recAsBytes.toString());

        var currHash = rec.resource.observation.value;

        if(!rec.encrypted){
            throw new Error(`${recNumber} is already hidden`);
        }

        var newHash = CryptoJS.AES.encrypt(currHash, ownerPrivateKey);

        rec.resource.observation.value = newHash;
        rec.encrypted = true;

        return rec.encrypted;
    }


    //Creates a record from a given file and owner.
    async createRec(ctx, recNumber, owner, configFile) {
        console.info('============= START : Create Record ===========');

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const ownerExists = await wallet.exists(owner);
        if (!ownerExists) {
            throw new Error(`An identity for the user ${owner} does not exist in the wallet.
                 Run the registerUser.js application before retrying`);
        }

        //Read the YAML file and assign appropriate variables

        let config = {};
        try {
            config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
        }catch (e) {
            console.log(e);
        }

        const refID = config.resource.id;

        const use = config.resource.meta.versionId.use;
        const verType = config.resource.meta.versionId.type;
        const verSystem = config.resource.meta.versionId.system;
        const verVal = config.resource.meta.versionId.value;
        const start = config.resource.meta.versionId.period.start;
        const end = config.resource.meta.versionId.period.end;

        const assignRef = config.resource.meta.versionId.assigner.reference;
        const assignID = config.resource.meta.versionId.assigner.id;
        const assignType = config.resource.meta.versionId.assigner.type;
        const assignDisp = config.resource.meta.versionId.assigner.display;

        const lastUpdated = config.resource.meta.lastUpdated;
        const metaSource = config.resource.meta.source;

        const period = new Period(start,end);
        const assigner = new Reference(assignRef, assignID, assignType, assignDisp);

        const versionID = new Identifier(use, verType, verSystem, verVal,
                    period, assigner);

        const meta = new Metadata(versionID, lastUpdated, metaSource);

        const basedOn = new Reference(config.resource.observation.basedOn.reference,
                config.resource.observation.basedOn.id, config.resource.observation.basedOn.type,
                config.resource.observation.basedOn.display);
        const partOf = new Reference(config.resource.observation.partOf.reference, config.resource.observation.partOf.id,
                    config.resource.observation.partOf.type, config.resource.observation.partOf.display);
        const subject = new Reference(config.resource.observation.subject.reference, config.resource.observation.subject.id,
                    config.resource.observation.subject.type, config.resource.observation.subject.display);
        const performer = new Reference(config.resource.observation.performer.reference, config.resource.observation.performer.id,
                    config.resource.observation.performer.type, config.resource.observation.performer.display);

        const obID = config.resource.observation.id;
        const status = config.resource.observation.status;
        const category = config.resource.observation.category;
        const effective = config.resource.observation.effective;
        const issued = config.resource.observation.issued;
        const value = config.resource.observation.value;
        const note = config.resource.observation.note;

        const walletContents = await wallet.export(owner);
        const ownerPrivateKey = walletContents.privateKey;


        var IPFSHash = CryptoJS.AES.encrypt(value, ownerPrivateKey);

        const observation = new Observation(obID, basedOn, partOf,
                status, category, subject, effective, issued, performer,
                IPFSHash, note);

        const resource = new Resource(resID, meta, observation);

       
        const rec = {
            owner,
            docType: 'rec',
            resource,
            true,
        };

        await ctx.stub.putState(recNumber, Buffer.from(JSON.stringify(rec)));
        console.info('============= END : Create Record ===========');
    }

    async queryAllRecs(ctx) {
        const startKey = 'REC0';
        const endKey = 'REC999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

}

module.exports = MedRec;
