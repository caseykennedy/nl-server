"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPStatus;
(function (HTTPStatus) {
    HTTPStatus[HTTPStatus["OK"] = 200] = "OK";
    HTTPStatus[HTTPStatus["BadRequest"] = 400] = "BadRequest";
    HTTPStatus[HTTPStatus["InternalServerError"] = 500] = "InternalServerError";
})(HTTPStatus = exports.HTTPStatus || (exports.HTTPStatus = {}));
// tslint:disable:no-any
// tslint:disable:max-line-length
const num = ((p, path) => typeof p === "number" ? undefined : `${path}: not a number`);
const str = ((p, path) => typeof p === "string" ? undefined : `${path}: not a string`);
function fun(returns, ...takes) {
    return ((...t) => takes
        .map((validator, i) => validator(t[i], "message"))
        .find((i) => i));
}
function optional(param) {
    return ((t, path) => t !== undefined && param(t, `${path}?`));
}
function arr(param) {
    return ((p, path) => p.find((t, i) => param(t, `${path}[${i}]`)));
}
function isNotObject(t, path) {
    return typeof t === "object" ? false : `${path}: not an object`;
}
function obj(p) {
    return ((inner, path) => isNotObject(inner, path) ||
        Object.keys(p)
            .map((checkme) => p[checkme](inner[checkme], `${path}.${checkme}`))
            .find((i) => i));
}
function asPartial(p) {
    return p;
}
// Define the API
const messageAction = obj({
    type: str,
    payload: optional(obj({})),
});
exports.apiObject = {
    message: {
        POST: fun(str, messageAction),
    },
};
//# sourceMappingURL=base.js.map