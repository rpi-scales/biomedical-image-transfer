// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Rec, RecController } from '../src';

describe('Rec', () => {
  let adapter: MockControllerAdapter;
  let recCtrl: ConvectorControllerClient<RecController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    recCtrl = ClientFactory(RecController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'RecController',
        name: join(__dirname, '..')
      }
    ]);
  });
  
  it('should create a default model', async () => {
    const modelSample = new Rec({
      id: uuid(),
      name: 'Test',
      created: Date.now(),
      modified: Date.now()
    });

    await recCtrl.create(modelSample);
  
    const justSavedModel = await adapter.getById<Rec>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});