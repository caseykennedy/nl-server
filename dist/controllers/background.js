"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("./wallet");
const svc_1 = require("../util/svc");
const node_1 = require("./node");
const settings_1 = require("./settings");
// import AnalyticsService from "./analytics";
let appService;
exports.initServices = () => {
    if (!appService) {
        appService = new svc_1.AppService();
        appService.add("setting", new settings_1.default());
        appService.add("node", new node_1.default());
        appService.add("wallet", new wallet_1.default());
        // appService.add("analytics", new AnalyticsService());
    }
    return appService;
};
//# sourceMappingURL=background.js.map