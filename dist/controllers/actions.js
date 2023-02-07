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
const messageTypes_1 = require("../util/messageTypes");
exports.controllers = {
    [messageTypes_1.default.GET_LATEST_BLOCK]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "getLatestBlock");
        // console.log("app:", app);
        // console.log("message:", message);
        // return { block: "Latest HNS Block" };
    }),
    [messageTypes_1.default.CREATE_NEW_WALLET]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createWallet", message.payload);
    }),
};
//# sourceMappingURL=actions.js.map