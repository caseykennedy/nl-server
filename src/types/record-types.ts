export type DSRecord = {
  type: 'DS';
  keyTag: number;
  algorithm: number;
  digestType: number;
  digest: string;
};

export type NSRecord = {
  type: 'NS';
  ns: string;
};

export type GLUE4Record = {
  type: 'GLUE4';
  ns: string;
  address: string;
};

export type GLUE6Record = {
  type: 'GLUE6';
  ns: string;
  address: string;
};

export type SYNTH4Record = {
  type: 'SYNTH4';
  address: string;
};

export type SYNTH6Record = {
  type: 'SYNTH6';
  address: string;
};

export type TXTRecord = {
  type: 'TXT';
  txt: string[];
};

export type UpdateRecordType =
  | DSRecord
  | NSRecord
  | GLUE4Record
  | GLUE6Record
  | SYNTH4Record
  | SYNTH6Record
  | TXTRecord;
