import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';

import { Medrec } from './medrec.model';

@Controller('medrec')
export class MedrecController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(@Param(Medrec) medrec: Medrec ) {
    await medrec.save();
  }

  @Invokable()
  public async queryRes(@Param(yup.string()) id: string) {
    return Medrec.getOne(id);
  }

  
}