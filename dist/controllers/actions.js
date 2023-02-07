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
const number_1 = require("../util/number");
exports.controllers = {
    // [MessageTypes.CONNECT]: async (app, message) => {
    //   return new Promise(async (resolve, reject) => {
    //     const { locked } = await app.exec("wallet", "getState");
    //     app.exec("analytics", "track", {
    //       name: "Bob3 Connect",
    //     });
    //     if (locked) {
    //       const popup = await openPopup();
    //       const onPopUpClose = (windowId: number) => {
    //         if (windowId === popup.id) {
    //           reject(new Error("user rejected."));
    //           browser.windows.onRemoved.removeListener(onPopUpClose);
    //         }
    //       };
    //       app.on("wallet.unlocked", async () => {
    //         resolve(true);
    //         await browser.windows.remove(popup.id as number);
    //         browser.windows.onRemoved.removeListener(onPopUpClose);
    //       });
    //       browser.windows.onRemoved.addListener(onPopUpClose);
    //       return;
    //     }
    //     resolve(true);
    //   });
    // },
    [messageTypes_1.default.SIGN_MESSAGE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { address, msg } = payload;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const queue = yield app.exec("wallet", "getTxQueue");
            if (queue.length) {
                return reject(new Error("user has unconfirmed tx."));
            }
            app.exec("analytics", "track", {
                name: "Bob3 Sign",
            });
            const requestJson = yield app.exec("wallet", "createSignMessageRequest", msg, address);
            yield app.exec("wallet", "addTxToQueue", requestJson);
            const popup = yield openPopup();
            closePopupOnAcceptOrReject(app, resolve, reject, popup);
        }));
    }),
    [messageTypes_1.default.SIGN_MESSAGE_WITH_NAME]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { name, msg } = payload;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const queue = yield app.exec("wallet", "getTxQueue");
            if (queue.length) {
                return reject(new Error("user has unconfirmed tx."));
            }
            app.exec("analytics", "track", {
                name: "Bob3 Sign with Name",
            });
            const requestJson = yield app.exec("wallet", "createSignMessageRequest", msg, undefined, name);
            yield app.exec("wallet", "addTxToQueue", requestJson);
            const popup = yield openPopup();
            closePopupOnAcceptOrReject(app, resolve, reject, popup);
        }));
    }),
    [messageTypes_1.default.SEND_TX]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { amount, address } = payload;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const queue = yield app.exec("wallet", "getTxQueue");
            if (queue.length) {
                return reject(new Error("user has unconfirmed tx."));
            }
            app.exec("analytics", "track", {
                name: "Bob3 Send",
            });
            const tx = yield app.exec("wallet", "createSend", {
                rate: +number_1.toDollaryDoos(0.01),
                outputs: [
                    {
                        value: +number_1.toDollaryDoos(amount || 0),
                        address: address,
                    },
                ],
            });
            yield app.exec("wallet", "addTxToQueue", tx);
            const popup = yield openPopup();
            closePopupOnAcceptOrReject(app, resolve, reject, popup);
        }));
    }),
    [messageTypes_1.default.SEND_OPEN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield app.exec("wallet", "getTxQueue");
                if (queue.length) {
                    return reject(new Error("user has unconfirmed tx."));
                }
                app.exec("analytics", "track", {
                    name: "Bob3 Open",
                });
                const tx = yield app.exec("wallet", "createOpen", payload);
                yield app.exec("wallet", "addTxToQueue", tx);
                const popup = yield openPopup();
                closePopupOnAcceptOrReject(app, resolve, reject, popup);
            }
            catch (e) {
                reject(e);
            }
        }));
    }),
    [messageTypes_1.default.SEND_BID]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { amount, lockup } = payload;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield app.exec("wallet", "getTxQueue");
                if (queue.length) {
                    return reject(new Error("user has unconfirmed tx."));
                }
                app.exec("analytics", "track", {
                    name: "Bob3 Bid",
                });
                const tx = yield app.exec("wallet", "createBid", payload);
                yield app.exec("wallet", "addTxToQueue", Object.assign({}, tx, { bid: amount }));
                const popup = yield openPopup();
                closePopupOnAcceptOrReject(app, resolve, reject, popup);
            }
            catch (e) {
                reject(e);
            }
        }));
    }),
    [messageTypes_1.default.SEND_REVEAL]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield app.exec("wallet", "getTxQueue");
                if (queue.length) {
                    return reject(new Error("user has unconfirmed tx."));
                }
                app.exec("analytics", "track", {
                    name: "Bob3 Reveal",
                });
                const tx = yield app.exec("wallet", "createReveal", {
                    name: payload,
                });
                yield app.exec("wallet", "addTxToQueue", tx);
                const popup = yield openPopup();
                closePopupOnAcceptOrReject(app, resolve, reject, popup);
            }
            catch (e) {
                reject(e);
            }
        }));
    }),
    [messageTypes_1.default.SEND_UPDATE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield app.exec("wallet", "getTxQueue");
                if (queue.length) {
                    return reject(new Error("user has unconfirmed tx."));
                }
                app.exec("analytics", "track", {
                    name: "Bob3 Update",
                });
                const tx = yield app.exec("wallet", "createUpdate", payload);
                yield app.exec("wallet", "addTxToQueue", tx);
                const popup = yield openPopup();
                closePopupOnAcceptOrReject(app, resolve, reject, popup);
            }
            catch (e) {
                reject(e);
            }
        }));
    }),
    [messageTypes_1.default.SEND_REDEEM]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield app.exec("wallet", "getTxQueue");
                if (queue.length) {
                    return reject(new Error("user has unconfirmed tx."));
                }
                app.exec("analytics", "track", {
                    name: "Bob3 Redeem",
                });
                const tx = yield app.exec("wallet", "createRedeem", {
                    name: payload,
                });
                yield app.exec("wallet", "addTxToQueue", tx);
                const popup = yield openPopup();
                closePopupOnAcceptOrReject(app, resolve, reject, popup);
            }
            catch (e) {
                reject(e);
            }
        }));
    }),
    [messageTypes_1.default.GET_WALLET_STATE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getState");
    }),
    [messageTypes_1.default.SELECT_ACCOUNT]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "selectAccount", message.payload);
    }),
    [messageTypes_1.default.SELECT_WALLET]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "selectWallet", message.payload);
    }),
    [messageTypes_1.default.GENERATE_NEW_MNEMONIC]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "generateNewMnemonic");
    }),
    [messageTypes_1.default.CREATE_NEW_WALLET]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createWallet", message.payload);
    }),
    [messageTypes_1.default.CREATE_NEW_WALLET_ACCOUNT]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createWalletAccount", message.payload);
    }),
    [messageTypes_1.default.GET_WALLETS_INFO]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getWalletsInfo");
    }),
    [messageTypes_1.default.GET_ACCOUNT_INFO]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getAccountInfo", message.payload && message.payload.accountName, message.payload && message.payload.id);
    }),
    [messageTypes_1.default.GET_ACCOUNT_KEY]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getAccountKey", message.payload && message.payload.accountName, message.payload && message.payload.id);
    }),
    [messageTypes_1.default.GET_ACCOUNTS_INFO]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getAccountsInfo", message.payload);
    }),
    [messageTypes_1.default.GET_ACCOUNT_NAMES]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getAccountNames", message.payload);
    }),
    [messageTypes_1.default.RENAME_ACCOUNT]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "renameAccount", message.payload.currentName, message.payload.rename);
    }),
    [messageTypes_1.default.GET_WALLET_IDS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getWalletIDs");
    }),
    [messageTypes_1.default.GET_WALLET_RECEIVE_ADDRESS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getWalletReceiveAddress", message.payload);
    }),
    [messageTypes_1.default.GET_WALLET_BALANCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getWalletBalance", message.payload);
    }),
    [messageTypes_1.default.GET_WALLET_INFO]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getWalletInfo", message.payload);
    }),
    [messageTypes_1.default.UNLOCK_WALLET]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "unlockWallet", message.payload);
    }),
    [messageTypes_1.default.ADD_TX_QUEUE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "addTxToQueue", message.payload);
    }),
    [messageTypes_1.default.SUBMIT_TX]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "submitTx", message.payload);
    }),
    [messageTypes_1.default.UPDATE_TX_FROM_QUEUE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "updateTxFromQueue", message.payload);
    }),
    [messageTypes_1.default.REJECT_TX]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "rejectTx", message.payload);
    }),
    [messageTypes_1.default.REMOVE_TX_FROM_QUEUE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "removeTxFromQueue", message.payload);
    }),
    [messageTypes_1.default.UPDATE_TX_QUEUE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "updateTxQueue");
    }),
    [messageTypes_1.default.GET_TX_QUEUE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getTxQueue");
    }),
    [messageTypes_1.default.GET_PENDING_TRANSACTIONS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getPendingTransactions", message.payload && message.payload.id, message.payload && message.payload.shouldBroadcast);
    }),
    [messageTypes_1.default.GET_NAME_NONCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getNameNonce");
    }),
    [messageTypes_1.default.GET_TX_NONCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getTXNonce");
    }),
    [messageTypes_1.default.GET_TRANSACTIONS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getTransactions", message.payload);
    }),
    [messageTypes_1.default.REVEAL_SEED]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "revealSeed", message.payload);
    }),
    [messageTypes_1.default.RESET_DOMAINS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "resetNames");
    }),
    [messageTypes_1.default.LOCK_WALLET]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "lockWallet");
    }),
    [messageTypes_1.default.CHECK_FOR_RESCAN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "checkForRescan", message.payload);
    }),
    [messageTypes_1.default.GET_BIDS_BY_NAME]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getBidsByName", message.payload);
    }),
    [messageTypes_1.default.STOP_RESCAN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "stopRescan");
    }),
    [messageTypes_1.default.FULL_RESCAN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "fullRescan");
    }),
    [messageTypes_1.default.GET_NONCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getNonce", message.payload.name, message.payload.address, message.payload.bid);
    }),
    [messageTypes_1.default.IMPORT_NONCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "importNonce", message.payload.name, message.payload.address, message.payload.value);
    }),
    [messageTypes_1.default.GET_COIN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getCoin", message.payload.hash, message.payload.index);
    }),
    [messageTypes_1.default.GET_DOMAIN_NAME]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getDomainName", message.payload);
    }),
    [messageTypes_1.default.GET_DOMAIN_NAMES]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "getDomainNames", message.payload);
    }),
    [messageTypes_1.default.CREATE_OPEN]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createOpen", message.payload);
    }),
    [messageTypes_1.default.CREATE_BID]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createBid", message.payload);
    }),
    [messageTypes_1.default.CREATE_REVEAL]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createReveal", message.payload);
    }),
    [messageTypes_1.default.CREATE_REDEEM]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createRedeem", message.payload);
    }),
    [messageTypes_1.default.CREATE_UPDATE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createUpdate", message.payload);
    }),
    [messageTypes_1.default.CREATE_TX]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createTx", message.payload);
    }),
    [messageTypes_1.default.CREATE_SEND]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "createSend", message.payload);
    }),
    [messageTypes_1.default.USE_LEDGER_PROXY]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("wallet", "useLedgerProxy", message.payload);
    }),
    [messageTypes_1.default.HASH_NAME]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "hashName", message.payload);
    }),
    [messageTypes_1.default.GET_NAME_RESOURCE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "getNameResource", message.payload);
    }),
    [messageTypes_1.default.GET_NAME_BY_HASH]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "getNameByHash", message.payload);
    }),
    [messageTypes_1.default.ESTIMATE_SMART_FEE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "estimateSmartFee", message.payload);
    }),
    [messageTypes_1.default.GET_LATEST_BLOCK]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("node", "getLatestBlock");
    }),
    [messageTypes_1.default.VERIFY_MESSAGE]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { msg, signature, address } = payload;
        return app.exec("node", "verifyMessage", msg, signature, address);
    }),
    [messageTypes_1.default.VERIFY_MESSAGE_WITH_NAME]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        const { payload } = message;
        const { msg, signature, name } = payload;
        return app.exec("node", "verifyMessageWithName", msg, signature, name);
    }),
    [messageTypes_1.default.GET_API]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "getAPI");
    }),
    [messageTypes_1.default.SET_RPC_HOST]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "setRPCHost", message.payload);
    }),
    [messageTypes_1.default.SET_RPC_KEY]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "setRPCKey", message.payload);
    }),
    [messageTypes_1.default.GET_ANALYTICS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "getAnalytics");
    }),
    [messageTypes_1.default.SET_ANALYTICS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "setAnalytics", message.payload);
    }),
    [messageTypes_1.default.GET_RESOLVE_HNS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "getResolveHns");
    }),
    [messageTypes_1.default.SET_RESOLVE_HNS]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("setting", "setResolveHns", message.payload);
    }),
    [messageTypes_1.default.RESET_DB]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("db", "resetDB", message.payload);
    }),
    [messageTypes_1.default.READ_DB_AS_BUFFER]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("db", "readDBAsBuffer", message.payload);
    }),
    [messageTypes_1.default.MP_TRACK]: (app, message) => __awaiter(this, void 0, void 0, function* () {
        return app.exec("analytics", "track", message.payload.name, message.payload.data);
    }),
};
// openPopup & closePopup
// Chrome extension popups which need to be refactored.
// async function openPopup() {
//   const tab = await browser.tabs.create({
//     url: browser.extension.getURL("popup.html"),
//     active: false,
//   });
//   const popup = await browser.windows.create({
//     tabId: tab.id,
//     type: "popup",
//     focused: true,
//     width: 357,
//     height: 600,
//   });
//   return popup;
// }
// function closePopupOnAcceptOrReject(
//   app: AppService,
//   resolve: (data: any) => void,
//   reject: (err: Error) => void,
//   popup: any
// ) {
//   app.on("wallet.txAccepted", (returnTx) => {
//     resolve(returnTx);
//     browser.windows.remove(popup.id as number);
//   });
//   app.on("wallet.txRejected", () => {
//     reject(new Error("user rejected."));
//     browser.windows.remove(popup.id as number);
//   });
// }
//# sourceMappingURL=actions.js.map