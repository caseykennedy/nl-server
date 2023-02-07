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
const svc_1 = require("../util/svc");
const fetch = require("node-fetch");
const rules = require("hsd/lib/covenants/rules");
const { states, statesByVal } = require("hsd/lib/covenants/namestate");
const Network = require("hsd/lib/protocol/network");
const networkType = process.env.NETWORK_TYPE || "main";
const NAME_CACHE = [];
const NAME_MAP = {};
class NodeService extends svc_1.GenericService {
    constructor() {
        super(...arguments);
        this.estimateSmartFee = (opt) => __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "estimatesmartfee",
                    params: [opt],
                }),
            });
        });
        this.getLatestBlock = () => __awaiter(this, void 0, void 0, function* () {
            const blockchanInfo = yield this.getBlockchainInfo();
            const block = yield this.getBlockByHeight(blockchanInfo.result.blocks);
            const { hash, height, time } = block || {};
            return {
                hash,
                height,
                time,
            };
        });
    }
    getHeaders() {
        return __awaiter(this, void 0, void 0, function* () {
            const { apiHost, apiKey } = yield this.exec("setting", "getAPI");
            // const apiHost = "https://api.handshakeapi.com/hsd";
            // const apiKey = "";
            return {
                "Content-Type": "application/json",
                Authorization: apiKey
                    ? "Basic " + Buffer.from(`x:${apiKey}`).toString("base64")
                    : "",
            };
        });
    }
    getTokenURL() {
        return __awaiter(this, void 0, void 0, function* () {
            const { apiHost, apiKey } = yield this.exec("setting", "getAPI");
            const [protocol, url] = apiHost.split("//");
            return `${protocol}//x:${apiKey}@${url}`;
        });
    }
    getBlockchainInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "getblockchaininfo",
                    params: [],
                }),
            });
        });
    }
    sendRawTransaction(txJSON) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "sendrawtransaction",
                    params: [txJSON],
                }),
            });
        });
    }
    getBlockByHeight(blockHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            // const cachedEntry = await get(this.store, `blockdata-${blockHeight}`);
            // if (cachedEntry) return cachedEntry;
            const headers = yield this.getHeaders();
            const block = yield this.fetchWrapper(`block/${blockHeight}`, {
                method: "GET",
                headers: headers,
            });
            // await put(this.store, `blockdata-${blockHeight}`, block);
            return block;
        });
    }
    addNameHash(name, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            // return put(this.store, `namehash-${hash}`, { result: name });
        });
    }
    hashName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return rules.hashName(name).toString("hex");
        });
    }
    getNameByHash(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (NAME_MAP[hash])
                return NAME_MAP[hash];
            // const cachedEntry = await get(this.store, `namehash-${hash}`);
            // if (cachedEntry) return cachedEntry;
            const headers = yield this.getHeaders();
            const name = yield this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "getnamebyhash",
                    params: [hash],
                }),
            });
            // await put(this.store, `namehash-${hash}`, name);
            NAME_CACHE.push(hash);
            NAME_MAP[hash] = name;
            if (NAME_CACHE.length > 50000) {
                const first = NAME_CACHE.shift();
                delete NAME_MAP[first];
            }
            return name;
        });
    }
    verifyMessage(msg, signature, address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg || !signature || !address) {
                throw new Error("Required paremeters include msg as a string, signature as a string, and address as a string.");
            }
            const headers = yield this.getHeaders();
            const result = yield this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "verifymessage",
                    params: [address, signature, msg],
                }),
            });
            if (result.error) {
                throw new Error("Error when verifymessage");
            }
            else {
                return result.result;
            }
        });
    }
    verifyMessageWithName(msg, signature, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg || !signature || !name) {
                throw new Error("Required paremeters include msg as a string, signature as a string, and name as a string.");
            }
            if (!rules.verifyName(name))
                throw new Error("Invalid name.");
            const ni = yield this.getNameInfo(name);
            const ownerHash = ni.result.info.owner.hash;
            const ownerIndex = ni.result.info.owner.index;
            const state = ni.result.info.state;
            if (!ownerHash)
                throw new Error("Could not find owner");
            else if (state !== statesByVal[states.CLOSED])
                throw new Error("Invalid name state.");
            const address = yield this.getCoin(ownerHash, ownerIndex);
            if (!address)
                throw new Error("Could not find owner");
            return yield this.verifyMessage(msg, signature, address.address);
        });
    }
    getNameInfo(tld) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "getnameinfo",
                    params: [tld],
                }),
            });
            // await put(this.store, `nameinfo-${tld}`, json);
        });
    }
    getNameResource(tld) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(null, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    method: "getnameresource",
                    params: [tld],
                }),
            });
        });
    }
    getCoin(txHash, txIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(`coin/${txHash}/${txIndex}`, {
                method: "GET",
                headers: headers,
            });
        });
    }
    getTXByHash(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            return this.fetchWrapper(`tx/${txHash}`, {
                method: "GET",
                headers: headers,
            });
        });
    }
    getBlockEntry(height) {
        return __awaiter(this, void 0, void 0, function* () {
            // const cachedEntry = await get(this.store, `entry-${height}`);
            // if (cachedEntry) return cachedEntry;
            const headers = yield this.getHeaders();
            const blockEntry = yield this.fetchWrapper(`header/${height}`, {
                method: "GET",
                headers: headers,
            });
            // await put(this.store, `entry-${height}`, blockEntry);
            return blockEntry;
        });
    }
    getTXByAddresses(addresses, startBlock, endBlock, transactions = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders();
            const { apiHost } = yield this.exec("setting", "getAPI");
            const resp = yield fetch(`${apiHost}/tx/address`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    addresses,
                    startBlock,
                    endBlock,
                }),
            });
            const json = yield resp.json();
            if (apiHost.includes("api.handshakeapi.com")) {
                if (resp.status === 200 && endBlock === json.endBlock) {
                    return transactions.concat(json.txs);
                }
                if (resp.status === 413) {
                    return this.getTXByAddresses(addresses, json.endBlock, endBlock, transactions.concat(json.txs));
                }
                throw new Error(`Unknown response status: ${resp.status}`);
            }
            else {
                return json;
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.store = bdb.create("/node-store");
            // await this.store.open();
            this.network = Network.get(networkType);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    fetchWrapper(path, init) {
        return __awaiter(this, void 0, void 0, function* () {
            const { apiHost } = yield this.exec("setting", "getAPI");
            const resp = yield fetch(path ? `${apiHost}/${path}` : apiHost, init);
            if (resp.status !== 200) {
                console.error(`Bad response code ${resp.status}.`);
                try {
                    const json = resp.json();
                    console.error("Body JSON:", json);
                }
                catch (e) {
                    console.error("Error printing body JSON.");
                }
                throw new Error(`Non-200 status code: ${resp.status}. Check the logs for more details.`);
            }
            return resp.json();
        });
    }
}
exports.default = NodeService;
//# sourceMappingURL=node.js.map