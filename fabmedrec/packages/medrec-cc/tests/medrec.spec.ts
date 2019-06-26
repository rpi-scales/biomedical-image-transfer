// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Medrec, MedrecController } from '../src';

describe('Medrec', () => {
  let adapter: MockControllerAdapter;
  let medrecCtrl: ConvectorControllerClient<MedrecController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    medrecCtrl = ClientFactory(MedrecController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'MedrecController',
        name: join(__dirname, '..')
      }
    ]);
  });
  
  it('should create a default model', async () => {
    const modelSample = new Medrec({
      id: uuid(),
      name: 'Test',
      created: Date.now(),
      modified: Date.now()
    });

    await medrecCtrl.create(modelSample);
  
    const justSavedModel = await adapter.getById<Medrec>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});