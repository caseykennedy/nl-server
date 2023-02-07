"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
const background_1 = require("./background");
const appService = background_1.getAppService();
function messageListener(message) {
    const res = handleMessage(message);
    //   console.log("message received:", message);
    return new Promise((resolve) => resolve(res));
}
exports.messageListener = messageListener;
function handleMessage(message) {
    const controller = actions_1.controllers[message.type];
    return controller(appService, message);
    //   if (controller) {
    //     return controller(message);
    //   }
}
//# sourceMappingURL=controller.js.map