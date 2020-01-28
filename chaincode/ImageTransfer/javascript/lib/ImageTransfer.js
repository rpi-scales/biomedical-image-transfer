/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
let Patient = require('./Patient.js');
let Doctor = require('./Doctor.js');

class ImageTransfer extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        let p1 = await new Patient("P1", "A", "B");
        await ctx.stub.putState(p1.userId, Buffer.from(JSON.stringify(p1)));

        let d1 = await new Doctor("D1", "E", "F");
        await ctx.stub.putState(d1.userId, Buffer.from(JSON.stringify(d1)));
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAll(ctx) {
        let queryString = {
            selector: {}
          };
          let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
          return queryResults;
    }

    async queryWithQueryString(ctx, queryString) {
        console.log('query String');
        console.log(JSON.stringify(queryString));
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        let allResults = [];
        while (true) {
            let res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
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

    async createUser(ctx, args) {
        args = JSON.parse(args);

        let userId = args.userId;
        let firstName = args.firstName;
        let lastName = args.lastName;
        let type = args.type;

        if (type == "Patient") {
            let newp = await new Patient(userId, firstName, lastName);
            await ctx.stub.putState(newp.userId, Buffer.from(JSON.stringify(newp)));
        } else{
            if (type == "Doctor"){
                let newd = await new Doctor(userId, firstName, lastName);
                await ctx.stub.putState(newd.userId, Buffer.from(JSON.stringify(newd)));
            }
        }
        let response = `User with userId ${userId} is updated in the world state`;
        return response;
    }

    async userExists(ctx,userId) {
        const buffer = await ctx.stub.getState(userId);
        return (!!buffer && buffer.length > 0);
    }

    async selectDoctor(ctx, args) {
        
    }

    async readMyAsset(ctx, myAssetId) {
        const exists = await this.userExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
}

module.exports = ImageTransfer;
