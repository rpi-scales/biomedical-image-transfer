/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MedicalRecordsContract extends Contract {

    async medicalRecordsExists(ctx, medicalRecordsId) {
        const buffer = await ctx.stub.getState(medicalRecordsId);
        return (!!buffer && buffer.length > 0);
    }

    async createMedicalRecords(ctx, medicalRecordsId, value) {
        const exists = await this.medicalRecordsExists(ctx, medicalRecordsId);
        if (exists) {
            throw new Error(`The medical records ${medicalRecordsId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicalRecordsId, buffer);
    }

    async readMedicalRecords(ctx, medicalRecordsId) {
        const exists = await this.medicalRecordsExists(ctx, medicalRecordsId);
        if (!exists) {
            throw new Error(`The medical records ${medicalRecordsId} does not exist`);
        }
        const buffer = await ctx.stub.getState(medicalRecordsId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateMedicalRecords(ctx, medicalRecordsId, newValue) {
        const exists = await this.medicalRecordsExists(ctx, medicalRecordsId);
        if (!exists) {
            throw new Error(`The medical records ${medicalRecordsId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicalRecordsId, buffer);
    }

    async deleteMedicalRecords(ctx, medicalRecordsId) {
        const exists = await this.medicalRecordsExists(ctx, medicalRecordsId);
        if (!exists) {
            throw new Error(`The medical records ${medicalRecordsId} does not exist`);
        }
        await ctx.stub.deleteState(medicalRecordsId);
    }

}

module.exports = MedicalRecordsContract;
