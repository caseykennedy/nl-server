"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../api/base");
const controller_1 = require("./controller");
const apiPrefix = "api";
// tslint:disable:no-any
function dropFirstParameter(fn) {
    return (...args) => fn(...args.splice(1));
}
/**
 * Initialize the routes in the given map
 * @param app Express application
 * @param prefix api prefix
 * @param api Api to iterate
 */
function hostApi(app, prefix, api, checkers) {
    const methods = {
        GET: app.get.bind(app),
        POST: app.post.bind(app),
        PUT: app.put.bind(app),
    };
    Object.keys(api).forEach((key) => {
        if (typeof api[key] !== "object") {
            const path = `/${prefix.join("/")}`;
            methods[key](path, (req, res) => {
                const body = req.body.message;
                const queryParameters = req.query;
                let handler;
                let checker;
                if (key === "GET") {
                    // GETs don't have a body, so drop it from the list
                    handler = dropFirstParameter(api[key]);
                    checker = dropFirstParameter(checkers[key]);
                }
                else {
                    handler = api[key];
                    checker = checkers[key];
                }
                console.log(body, queryParameters);
                const checkResult = checker(body, queryParameters);
                if (checkResult) {
                    res.status(base_1.HTTPStatus.BadRequest);
                    res.send(`Bad request: ${checkResult}`);
                }
                else {
                    handler(body, queryParameters)
                        .then((value) => {
                        res.status(200);
                        res.send(JSON.stringify({ message: value }));
                    })
                        .catch(() => {
                        res.status(base_1.HTTPStatus.InternalServerError);
                        res.send("Internal server error");
                    });
                }
            });
        }
        else {
            hostApi(app, prefix.concat([key]), api[key], checkers[key]);
        }
    });
}
// tslint:enable:no-any
/**
 * Initialize routing.
 * @param app Express application
 */
function initRoutes(app) {
    hostApi(app, [apiPrefix], {
        message: {
            POST: controller_1.messageListener,
        },
    }, base_1.apiObject);
}
exports.initRoutes = initRoutes;
//# sourceMappingURL=routes.js.map