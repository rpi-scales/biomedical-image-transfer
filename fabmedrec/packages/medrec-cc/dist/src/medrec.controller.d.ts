import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import { ConvectorController } from '@worldsibu/convector-core';
import { Medrec } from './medrec.model';
export declare class MedrecController extends ConvectorController<ChaincodeTx> {
    create(medrec: Medrec): Promise<void>;
}
