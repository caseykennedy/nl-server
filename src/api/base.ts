import MessageTypes from "../util/messageTypes";

export type HTTPMethod = "GET" | "POST" | "PUT";

export enum HTTPStatus {
  OK = 200,
  BadRequest = 400,
  InternalServerError = 500,
}

export interface ApiResponse<Res> {
  message: Res;
}

// tslint:disable:no-any
// tslint:disable:max-line-length

const num = ((p: any, path: string) =>
  typeof p === "number" ? undefined : `${path}: not a number`) as any as number;
const str = ((p: any, path: string) =>
  typeof p === "string" ? undefined : `${path}: not a string`) as any as string;

function fun<T, TS extends [any?, any?]>(returns: T, ...takes: TS) {
  return ((...t: TS) =>
    takes
      .map((validator, i) => validator(t[i], "message"))
      .find((i) => i)) as any as (...t: TS) => Promise<T>;
}

function optional<T>(param: T) {
  return ((t: T | undefined, path: string) =>
    t !== undefined && (param as any)(t, `${path}?`)) as any as T | undefined;
}

function arr<T>(param: T) {
  return ((p: T[], path: string) =>
    p.find((t, i) => (param as any)(t, `${path}[${i}]`))) as any as T[];
}

function isNotObject(t: any, path: string) {
  return typeof t === "object" ? false : `${path}: not an object`;
}

function obj<T extends object>(p: T) {
  return ((inner: T, path: string) =>
    isNotObject(inner, path) ||
    Object.keys(p)
      .map((checkme: string) =>
        (p as any)[checkme]((inner as any)[checkme], `${path}.${checkme}`)
      )
      .find((i) => i)) as any as T;
}

function asPartial<T>(p: T): Partial<T> {
  return p;
}

// Define the API

const messageAction = obj({
  type: str,
  payload: optional(obj({})),
});
export type MessageAction = typeof messageAction;

export const apiObject = {
  message: {
    POST: fun(str, messageAction),
  },
};

export type ApiMap = typeof apiObject;
