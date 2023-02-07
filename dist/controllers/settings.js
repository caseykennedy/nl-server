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
const RPC_HOST_DB_KEY = "rpc_host";
const RPC_API_KEY_DB_KEY = "rpc_api_key";
const ANALYTICS_OPT_IN_KEY = "analytics_opt_in_key";
const RESOLVE_HNS = "resolve_hns";
const DEFAULT_HOST = process.env.DEFAULT_HOST || "https://api.handshakeapi.com/hsd";
const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY || "";
class SettingService extends svc_1.GenericService {
    // store: typeof DB;
    constructor() {
        super();
        this.getAPI = () => __awaiter(this, void 0, void 0, function* () {
            // const apiHost = this.apiHost || (await get(this.store, RPC_HOST_DB_KEY));
            // const apiKey = this.apiKey || (await get(this.store, RPC_API_KEY_DB_KEY));
            const apiHost = "https://api.handshakeapi.com/hsd";
            const apiKey = "";
            return {
                apiHost: apiHost || DEFAULT_HOST,
                apiKey: apiKey || DEFAULT_API_KEY,
            };
        });
        this.setRPCHost = (apiHost) => __awaiter(this, void 0, void 0, function* () {
            // await put(this.store, RPC_HOST_DB_KEY, apiHost);
            this.apiHost = apiHost;
            return true;
        });
        this.setRPCKey = (apiKey) => __awaiter(this, void 0, void 0, function* () {
            // await put(this.store, RPC_API_KEY_DB_KEY, apiKey);
            this.apiKey = apiKey;
            return true;
        });
        this.setAnalytics = (optIn = false) => __awaiter(this, void 0, void 0, function* () {
            // await put(this.store, ANALYTICS_OPT_IN_KEY, optIn);
            return true;
        });
        this.getAnalytics = () => __awaiter(this, void 0, void 0, function* () {
            // const optIn = await get(this.store, ANALYTICS_OPT_IN_KEY);
            const optIn = true;
            return !!optIn;
        });
        this.apiHost = "";
        this.apiKey = "";
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.store = bdb.create("/setting-store");
            // await this.store.open();
            const { apiKey, apiHost } = yield this.getAPI();
            this.apiKey = apiKey;
            this.apiHost = apiHost;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = SettingService;
//# sourceMappingURL=settings.js.map