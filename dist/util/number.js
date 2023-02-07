"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const moment_1 = require("moment");
const Network = require('hsd/lib/protocol/network');
const networkType = process.env.NETWORK_TYPE || 'main';
const network = Network.get(networkType);
exports.fromDollaryDoos = (raw, decimals = 2) => {
    if (isNaN(raw))
        return '';
    return new bignumber_js_1.default(raw).dividedBy(Math.pow(10, 6)).toFixed(decimals);
};
exports.toDollaryDoos = (raw) => {
    if (isNaN(raw))
        return '';
    return new bignumber_js_1.default(raw).multipliedBy(Math.pow(10, 6)).toFixed(0);
};
exports.formatNumber = (num) => {
    const numText = typeof num === 'string' ? num : num.toString();
    const [first, decimals] = numText.split('.');
    const realNum = first.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    if (decimals) {
        return `${realNum}.${decimals}`;
    }
    return realNum;
};
exports.heightToMoment = (blockHeight) => {
    return moment_1.default(1583164278000).add(blockHeight * (network.pow.targetSpacing * 1000));
};
//# sourceMappingURL=number.js.map