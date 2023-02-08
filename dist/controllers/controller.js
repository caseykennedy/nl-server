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
const actions_1 = require("./actions");
const background_1 = require("./background");
function messageListener(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = background_1.initServices();
        const res = handleMessage(app, message);
        //   console.log("message received:", message);
        return new Promise((resolve) => resolve(res));
    });
}
exports.messageListener = messageListener;
function handleMessage(app, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = actions_1.controllers[message.type];
        if (controller) {
            return controller(app, message);
        }
    });
}
//# sourceMappingURL=controller.js.map