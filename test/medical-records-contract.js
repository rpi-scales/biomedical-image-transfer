/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MedicalRecordsContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('MedicalRecordsContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MedicalRecordsContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"medical records 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"medical records 1002 value"}'));
    });

    describe('#medicalRecordsExists', () => {

        it('should return true for a medical records', async () => {
            await contract.medicalRecordsExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a medical records that does not exist', async () => {
            await contract.medicalRecordsExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMedicalRecords', () => {

        it('should create a medical records', async () => {
            await contract.createMedicalRecords(ctx, '1003', 'medical records 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"medical records 1003 value"}'));
        });

        it('should throw an error for a medical records that already exists', async () => {
            await contract.createMedicalRecords(ctx, '1001', 'myvalue').should.be.rejectedWith(/The medical records 1001 already exists/);
        });

    });

    describe('#readMedicalRecords', () => {

        it('should return a medical records', async () => {
            await contract.readMedicalRecords(ctx, '1001').should.eventually.deep.equal({ value: 'medical records 1001 value' });
        });

        it('should throw an error for a medical records that does not exist', async () => {
            await contract.readMedicalRecords(ctx, '1003').should.be.rejectedWith(/The medical records 1003 does not exist/);
        });

    });

    describe('#updateMedicalRecords', () => {

        it('should update a medical records', async () => {
            await contract.updateMedicalRecords(ctx, '1001', 'medical records 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"medical records 1001 new value"}'));
        });

        it('should throw an error for a medical records that does not exist', async () => {
            await contract.updateMedicalRecords(ctx, '1003', 'medical records 1003 new value').should.be.rejectedWith(/The medical records 1003 does not exist/);
        });

    });

    describe('#deleteMedicalRecords', () => {

        it('should delete a medical records', async () => {
            await contract.deleteMedicalRecords(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a medical records that does not exist', async () => {
            await contract.deleteMedicalRecords(ctx, '1003').should.be.rejectedWith(/The medical records 1003 does not exist/);
        });

    });

});