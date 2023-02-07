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
const eventemitter2_1 = require("eventemitter2");
class GenericService extends eventemitter2_1.EventEmitter2 {
    constructor() {
        super({ wildcard: true, delimiter: "." });
        this.nonce = 0;
        this._services = {};
        this._serviceName = "";
    }
    setServiceName(serviceName, services) {
        this._serviceName = serviceName;
        this._services = services;
    }
    exec(serviceName, methodName, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const service = this._services[serviceName];
                // @ts-ignore
                const method = service[methodName];
                try {
                    console.log({ serviceName, methodName, params });
                    const response = yield method.apply(service, params);
                    console.log({ serviceName, methodName, response });
                    resolve(response);
                }
                catch (e) {
                    console.error(e, { serviceName, methodName });
                    reject(e);
                }
            }));
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.GenericService = GenericService;
class AppService extends GenericService {
    constructor() {
        super();
        this.services = {};
        this.setServiceName("app", this.services);
    }
    add(serviceName, service) {
        const that = this;
        this.services[serviceName] = service;
        service.setServiceName(serviceName, this.services);
        service.on("*", function (...args) {
            // @ts-ignore
            that.emit([serviceName, this.event], ...args);
        });
        return this;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const serviceName in this.services) {
                try {
                    yield this.services[serviceName].start();
                    console.log(`${serviceName} initialized`, { service: serviceName });
                }
                catch (e) {
                    console.error(e, { service: serviceName });
                }
            }
            console.log("app initialized");
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const serviceName in this.services) {
                yield this.services[serviceName].stop();
            }
        });
    }
}
exports.AppService = AppService;
//# sourceMappingURL=svc.js.map