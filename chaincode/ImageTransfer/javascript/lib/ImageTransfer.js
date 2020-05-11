/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
let Patient = require('./Patient.js');
let Doctor = require('./Doctor.js');

class ImageTransfer extends Contract {

    async initLedger (ctx) {}

    async createPatient(ctx, args) {
        args = JSON.parse(args);
        let patient = await new Patient(args.userId, args.firstName, args.lastName, args.publicKey);
        patient.age = args.age;
        patient.insurance = args.insurance;
        await ctx.stub.putState(args.userId, Buffer.from(JSON.stringify(patient)));
        let response = `User with userId ${args.userId} is updated in the world state`;
        return response;
    }

    async createDoctor(ctx, args) {
        args = JSON.parse(args);
        let doctor = await new Doctor(args.userId, args.firstName, args.lastName, args.publicKey);
        doctor.specialty = args.specialty;
        await ctx.stub.putState(args.userId, Buffer.from(JSON.stringify(doctor)));
        let response = `User with userId ${args.userId} is updated in the world state`;
        return response;
    }

    // A doctor shares information with another doctor
    async shareInfowith(ctx, args){
        args = JSON.parse(args);

        let doctorId = args.userId;
        let doctorIdpicked = args.doctorId;
        let patientId = args.patientId;
        let imgKey = args.imgKey;

        let doctorAsBytes = await ctx.stub.getState(doctorId);
        let doctor = await JSON.parse(doctorAsBytes.toString());

        let doctorpickedAsBytes = await ctx.stub.getState(doctorIdpicked);
        let doctorpicked = await JSON.parse(doctorpickedAsBytes.toString());
        
        let patientAsBytes = await ctx.stub.getState(patientId);
        let patient = await JSON.parse(patientAsBytes.toString());
        
        if(patient.specialist.indexOf(doctorIdpicked) == -1) {
            patient.specialist.push(doctorIdpicked);  
        }
        let patientrec = this.findPatient(doctor, patientId, "primary");
        if(patientrec == null) return `Patient Record not found`;
        patientrec.ImageKeys = imgKey;  // Update the original Image key, which is only available for the specialist
        doctorpicked.otherPatientRecords.push(patientrec);
    
        await ctx.stub.putState(doctorId, Buffer.from(JSON.stringify(doctor)));
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
        await ctx.stub.putState(doctorIdpicked, Buffer.from(JSON.stringify(doctorpicked)));

        return `Transaction ${doctorId} shareinfowith ${doctorIdpicked} of patient ${patientId} success`;
    }

    async queryAll(ctx) {
        let queryString = { selector: {} };
        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;
    }

    async queryWithQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        let allResults = [];
        while (true) {
            let res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                await resultsIterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    async queryByObjectType(ctx, objectType) {
        let queryString = {
          selector: { type: objectType }
        };
        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;
    }

    async userExists(ctx,userId) {
        const buffer = await ctx.stub.getState(userId);
        return (!!buffer && buffer.length > 0);
    }

    async giveAccessTo(ctx, args) {
        args = JSON.parse(args);

        let patientId = args.userId;
        let doctorId = args.picked;
        let role = "primary";

        let doctorAsBytes = await ctx.stub.getState(doctorId);
        let doctor = await JSON.parse(doctorAsBytes.toString());
        let patientAsBytes = await ctx.stub.getState(patientId);
        let patient = await JSON.parse(patientAsBytes.toString());

        if (role == "primary") {
            patient.primaryDoctor = doctorId;
        } else {
            patient.specialist.push(doctorId);
        }
        if (this.findPatient(doctor, patientId, "primary")==null) {
            doctor.primaryPatientRecords.push({
                UserId: patientId,
                Name: patient.firstName,
                ImageKeys: "",
                Notes: "",
                Role: role
            });
        }
        
        await ctx.stub.putState(doctorId, Buffer.from(JSON.stringify(doctor)));
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
        
        let response = `Transaction giveAccessTo success with patientId ${patientId} and doctorId ${doctorId}`;
        return response;
    }

    async updateImageKey(ctx, args) {
        args = JSON.parse(args);

        let patientId = args.userId;
        let doctorId = args.picked;
        let imgKey = args.imgKey;
        
        // Update doctor side
        let doctorAsBytes = await ctx.stub.getState(doctorId);
        let doctor = await JSON.parse(doctorAsBytes.toString());
        
        let patientInfo = this.findPatient(doctor, patientId, "primary");
        patientInfo.ImageKeys = imgKey;
        await ctx.stub.putState(doctorId, Buffer.from(JSON.stringify(doctor)));
        
        let response = patientInfo.ImageKeys;
        return response;
    }



    async readMyAsset(ctx, myAssetId) {
        const exists = await this.userExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = buffer.toString();
        return asset;
    }

    // helper functions
    findPatient(doctor, patientId, role) {
        let patientInfo;
        if(role == "primary") {
            patientInfo = doctor.primaryPatientRecords;
        } else {
            patientInfo = doctor.otherPatientRecords;
        }
        var i;
        for (i = 0; i < patientInfo.length; i++) {
            if (patientInfo[i].UserId == patientId) {
                return patientInfo[i];
            }
        }
        return;
    }

    //Not working
    async getInfo(inputId) {
        let userAsBytes = await ctx.stub.getState(inputId);
        let user = await JSON.parse(userAsBytes.toString());
        return user;
    }
}

module.exports = ImageTransfer;
