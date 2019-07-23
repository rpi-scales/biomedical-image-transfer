import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import { ConvectorController } from '@worldsibu/convector-core';
import { Rec } from './rec.model';
export declare class RecController extends ConvectorController<ChaincodeTx> {
    create(rec: Rec): Promise<void>;
}
