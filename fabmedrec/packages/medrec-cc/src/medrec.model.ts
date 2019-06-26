import * as yup from 'yup';
import data from './configrsrc.json'
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

class 

interface Period{
  start: Date;
  end: Date;
}

interface Reference{
  ref: string;
  type: string;
  id: string; 
  display: string;
}

interface Identifier{
  use: string;
  type: string;
  system: string;
  value: string;
  period: Period;
  assigner: Reference;
}

interface Network{
  address: string;
  type: string;
}

interface Agent{
  type: string;
  role: string;
  who: Reference;
  altID: string;
  name: string;
  requestor: string;
  location: Reference;
  policy: string;
  media: string;
  network: Network;
  purpose: string;

}

interface Source{
  site: string;
  observer: Reference;
  type: string;
}

interface Detail{
  type: string;
  value: string;
}

interface Entity{
  what: Reference;
  type: string;
  role: string;
  lifecycle: string;
  secLabel: string;
  name: string;
  description: string;
  query: string;
  detail: Detail;
}

interface AuditEvent{
  type: string;
  subtype: string;
  action: string;
  recorded: Date;
  outcome: string;
  outcomeDesc: string;
  purpose: string;
  agent: Agent;
  source: Source;
  entity: Entity;
}

interface Metadata{
  versionID: string;
  lastUpdated: Date;
  source: string;
  auditLog: Array<AuditEvent>;
}

interface Media{
  identifier: Identifier;
  basedOn: Reference;
  partOf: Reference;
  status: string;
  type: string;
  modality: string;
  view: string;
  subject: Reference;
  encounter: Reference;
  created: Date;
  issued: Date;
  operator: Reference;
  reasonCode: string;
  bodySite: string;
  deviceName: string;
  device: Reference;
  height: number;
  width: number;
  frames: number;
  duration: number;
  content: string;
  note: string;
}

interface Observation{
  ID: string;
  status: string;
  category: string;
  effective: Date;
  value: Media;
}


export class Medrec extends ConvectorModel<Medrec> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.medrec';

  @Required()
  @ReadOnly()
  public ID: string;

  @Required()
  public metaData: Metadata;

  @Required()
  @Validate(yup.number())
  public observation: Observation;
}
