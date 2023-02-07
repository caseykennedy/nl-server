"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("./wallet");
const svc_1 = require("../util/svc");
const node_1 = require("./node");
const settings_1 = require("./settings");
const actions_1 = require("./actions");
let appService;
const initServices = () => {
    if (!appService) {
        appService = new svc_1.AppService();
        appService.add("setting", new settings_1.default());
        // appService.add("analytics", new AnalyticsService());
        appService.add("node", new node_1.default());
        appService.add("wallet", new wallet_1.default());
    }
    return appService;
};
const app = initServices();
function messageListener(message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield app.start();
        const res = handleMessage(app, message);
        //   console.log("message received:", message);
        return new Promise((resolve) => resolve(res));
    });
}
exports.messageListener = messageListener;
function handleMessage(app, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = actions_1.controllers[message.type];
        return controller(app, message);
        //   if (controller) {
        //     return controller(appService, message);
        //   }
    });
}
//# sourceMappingURL=controller.js.map