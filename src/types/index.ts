export * from "./record-types";

export type SignMessageRequest = {
  hash: string;
  method: "SIGN_MESSAGE" | "SIGN_MESSAGE_WITH_NAME";
  walletId: string;
  data: {
    name?: string;
    address?: string;
    message: string;
  };
  bid: undefined;
  height: 0;
};

export type TxInput = {
  address: string;
  value: number;
  path: {
    change: boolean;
  };
  coin?: TxOutput;
};

export type TxOutput = {
  address: string;
  value: number;
  covenant: Covenant;
  owned?: boolean;
  path: {
    change: boolean;
  };
};

export type Transaction = {
  method: undefined;
  block: string;
  confirmations: number;
  date: Date;
  fee: number;
  hash: string;
  height: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  rate: number;
  time: number;
  tx: string;
  bid?: number;
  blind?: number;
};
