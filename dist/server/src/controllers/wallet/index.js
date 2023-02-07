"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { ActionType as AppActionType } from '@src/ui/ducks/app';
// import { ActionTypes, setDomainNames } from '@src/ui/ducks/domains';
// import { setInfo } from '@src/ui/ducks/node';
// import { ActionType as QueueActionType, setTXQueue } from '@src/ui/ducks/queue';
// import type {
//   SignMessageRequest,
//   Transaction,
// } from '@src/ui/ducks/transactions';
// import {
//   ActionType,
//   setTransactions,
//   SIGN_MESSAGE_METHOD,
//   SIGN_MESSAGE_WITH_NAME_METHOD,
// } from '@src/ui/ducks/transactions';
// import {
//   ActionType as WalletActionType,
//   setAccountNames,
//   setCurrentAccount,
//   setReceiveAddress,
//   setWalletBalance,
// } from '@src/ui/ducks/wallet';
// import pushMessage from '@src/util/pushMessage';
// import { GenericService } from '@src/util/svc';
const crypto = require("crypto");
const Mnemonic = require("hsd/lib/hd/mnemonic");
const WalletDB = require("hsd/lib/wallet/walletdb");
const Network = require("hsd/lib/protocol/network");
const Covenant = require("hsd/lib/primitives/covenant");
const rules = require("hsd/lib/covenants/rules");
const { states } = require("hsd/lib/covenants/namestate");
const Address = require("hsd/lib/primitives/address");
const TX = require("hsd/lib/primitives/tx");
const NameState = require("hsd/lib/covenants/namestate");
const common = require("hsd/lib/wallet/common");
const ChainEntry = require("hsd/lib/blockchain/chainentry");
const MTX = require("hsd/lib/primitives/mtx");
const Output = require("hsd/lib/primitives/output");
const Outpoint = require("hsd/lib/primitives/outpoint");
const MasterKey = require("hsd/lib/wallet/masterkey");
const BN = require("bcrypto/lib/bn.js");
const bdb = require("bdb");
const DB = require("bdb/lib/DB");
const layout = require("hsd/lib/wallet/layout").txdb;
const { Resource } = require("hsd/lib/dns/resource");
const blake2b = require("bcrypto/lib/blake2b");
const svc_1 = require("../../util/svc");
const bid_reveal_1 = require("./bid-reveal");
const blind_bid_1 = require("./blind-bid");
const number_1 = require("../../util/number");
const transaction_1 = require("../../util/transaction");
const node_1 = require("../node");
const { types, typesByVal } = rules;
const networkType = process.env.NETWORK_TYPE || "main";
const LOOKAHEAD = 100;
const ONE_MINUTE = 60000;
const MAGIC_STRING = `handshake signed message:\n`;
class WalletService extends svc_1.GenericService {
    constructor() {
        super();
        this.lockWallet = () => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(this.selectedID);
            yield wallet.lock();
            // this.emit('locked');
            this.passphrase = undefined;
            this.locked = true;
        });
        this.unlockWallet = (password) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(this.selectedID);
            yield wallet.unlock(password, ONE_MINUTE);
            this.passphrase = password;
            this.locked = false;
            yield wallet.lock();
            // this.emit('unlocked', this.selectedID);
        });
        this.getState = () => __awaiter(this, void 0, void 0, function* () {
            const tip = yield this.wdb.getTip();
            return {
                selectedID: this.selectedID,
                locked: this.locked,
                tip: {
                    hash: tip.hash.toString("hex"),
                    height: tip.height,
                    time: tip.time,
                },
                rescanning: this.rescanning,
                watchOnly: this.watchOnly,
            };
        });
        this.getWalletInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const balance = yield wallet.getBalance();
            return wallet.getJSON(false, balance);
        });
        this.pushState = () => __awaiter(this, void 0, void 0, function* () {
            const walletState = yield this.getState();
            yield pushMessage({
                type: WalletActionType.SET_WALLET_STATE,
                payload: walletState,
            });
        });
        this.pushBobMessage = (message) => __awaiter(this, void 0, void 0, function* () {
            yield pushMessage({
                type: AppActionType.SET_BOB_MESSAGE,
                payload: message,
            });
        });
        this.selectWallet = (id) => __awaiter(this, void 0, void 0, function* () {
            const walletIDs = yield this.getWalletIDs();
            const accountNames = yield this.getAccountNames(id);
            const walletOptions = {
                id: id,
                accountName: "default",
                depth: 0,
            };
            if (!walletIDs.includes(id)) {
                throw new Error(`Cannot find wallet - ${id}`);
            }
            if (this.selectedID !== id) {
                const wallet = yield this.wdb.get(id);
                yield wallet.lock();
                // this.emit('locked');
                this.selectedAccount = "default";
                this.transactions = null;
                this.domains = null;
                this.locked = true;
                yield this.pushState();
                yield pushMessage(setTransactions([]));
                yield pushMessage(setDomainNames([]));
                yield pushMessage(setTXQueue([]));
                yield pushMessage(setAccountNames(accountNames));
                try {
                    yield pushMessage(setWalletBalance(yield this.getWalletBalance()));
                }
                catch (e) {
                    console.error(e);
                }
            }
            yield pushMessage(setReceiveAddress(yield this.getWalletReceiveAddress(walletOptions)));
            this.selectedID = id;
        });
        this.getWalletIDs = () => __awaiter(this, void 0, void 0, function* () {
            return this.wdb.getWallets();
        });
        this.getWalletsInfo = () => __awaiter(this, void 0, void 0, function* () {
            const wallets = yield this.wdb.getWallets();
            const walletsInfo = [];
            for (const wid of wallets) {
                const info = yield this.wdb.get(wid);
                const accounts = yield this.getAccountNames(wid);
                const { accountDepth, master: { encrypted }, watchOnly, } = info;
                walletsInfo.push({ wid, accountDepth, encrypted, watchOnly, accounts });
            }
            return walletsInfo;
        });
        this.getAccountNames = (walletID) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(walletID || this.selectedID);
            const accounts = yield wallet.getAccounts();
            return accounts;
        });
        this.getAccountsInfo = (walletID) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(walletID || "primary");
            const walletAccounts = yield wallet.getAccounts();
            const accounts = [];
            for (const accountName of walletAccounts) {
                const account = yield this.getAccountInfo(accountName);
                const { accountIndex, name, type, watchOnly, wid } = account;
                accounts.push({ accountIndex, name, type, watchOnly, wid });
            }
            return accounts;
        });
        this.getAccountInfo = (accountName, id) => __awaiter(this, void 0, void 0, function* () {
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            if (!wallet)
                return null;
            const account = yield wallet.getAccount(accountName || "default");
            const balance = yield wallet.getBalance(account.accountIndex);
            return Object.assign({ wid: walletId }, account.getJSON(balance));
        });
        this.renameAccount = (currentName, rename) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(this.selectedID);
            if (rename === currentName) {
                return;
            }
            try {
                yield wallet.renameAccount(currentName, rename);
            }
            catch (e) {
                console.error(e);
            }
            yield this.selectAccount(rename);
            yield pushMessage(setCurrentAccount(rename));
        });
        this.selectAccount = (accountName) => __awaiter(this, void 0, void 0, function* () {
            const accountNames = yield this.getAccountNames();
            const account = yield this.getAccountInfo(accountName);
            const { accountIndex, name, type, watchOnly, wid } = account;
            const walletOptions = {
                id: this.selectedID,
                accountName,
                depth: 0,
            };
            if (!accountNames.includes(accountName)) {
                throw new Error(`Cannot find account - ${accountName}`);
            }
            if (this.selectedAccount !== accountName) {
                this.selectedAccount = accountName;
                this.transactions = null;
                this.domains = null;
                yield this.pushState();
                yield pushMessage(setTransactions([]));
                yield pushMessage(setDomainNames([]));
                yield pushMessage(setTXQueue([]));
                try {
                    yield pushMessage(setWalletBalance(yield this.getWalletBalance(this.selectedID, accountName)));
                }
                catch (e) {
                    console.error(e);
                }
            }
            yield pushMessage(setReceiveAddress(yield this.getWalletReceiveAddress(walletOptions)));
            return {
                accountIndex,
                name,
                type,
                watchOnly,
                wid,
            };
        });
        this.getWalletReceiveAddress = (options = {
            depth: -1,
        }) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(options.id || this.selectedID);
            const account = yield wallet.getAccount(options.accountName || "default");
            return account
                .deriveReceive(options.depth > -1 ? options.depth : account.receiveDepth - 1)
                .getAddress()
                .toString(this.network);
        });
        this.getWalletBalance = (id, accountName) => __awaiter(this, void 0, void 0, function* () {
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const balance = yield wallet.getBalance(accountName || "default");
            return wallet.getJSON(false, balance).balance;
        });
        this.getPendingTransactions = (id, shouldBroadcast = true) => __awaiter(this, void 0, void 0, function* () {
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const wtxs = yield wallet.getPending();
            const txs = [];
            for (const wtx of wtxs) {
                if (!wtx.tx.isCoinbase()) {
                    txs.push(wtx.tx);
                }
            }
            const sorted = common.sortDeps(txs);
            yield this._addPrevoutCoinToPending(txs);
            if (shouldBroadcast) {
                for (const tx of sorted) {
                    yield this.exec("node", "sendRawTransaction", tx.toHex());
                }
            }
            return txs;
        });
        this.revealSeed = (passphrase) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const data = yield wallet.master.getJSON(this.network, true);
            if (wallet.watchOnly) {
                throw new Error("Cannot reveal seed phrase for watch-only wallet.");
            }
            else {
                // should always be encrypted - seed cannot be revealed via the UI until
                // the user has finished onboarding. checking here for completeness' sake
                if (!data.encrypted) {
                    return data.key.mnemonic.phrase;
                }
                const parsedData = {
                    encrypted: data.encrypted,
                    alg: data.algorithm,
                    iv: Buffer.from(data.iv, "hex"),
                    ciphertext: Buffer.from(data.ciphertext, "hex"),
                    n: data.n,
                    r: data.r,
                    p: data.p,
                };
                const mk = new MasterKey(parsedData);
                yield mk.unlock(passphrase, 100);
                return mk.mnemonic.getPhrase();
            }
        });
        this.resetNames = () => __awaiter(this, void 0, void 0, function* () {
            this._getNameNonce++;
        });
        this.getTransactions = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { id } = opts || {};
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            if (this.transactions ? .length : ) {
                yield pushMessage({
                    type: ActionType.SET_TRANSACTIONS,
                    payload: this.transactions,
                });
            }
            const latestBlock = yield this.exec("node", "getLatestBlock");
            let txs = yield wallet.getHistory("default");
            if (txs.length === this.transactions ? .length : ) {
                return this.transactions;
            }
            txs = txs.sort((a, b) => {
                if (a.height > b.height)
                    return 1;
                if (b.height > a.height)
                    return -1;
                if (a.time > b.time)
                    return 1;
                if (b.time > a.time)
                    return -1;
                return 0;
            });
            txs = txs.reverse();
            let details = yield wallet.toDetails(txs);
            const transactions = [];
            let i = 0;
            for (const item of details) {
                this.pushBobMessage(`Loading ${++i} of ${details.length} TX...`);
                const json = item.getJSON(this.network, latestBlock.height);
                const action = transaction_1.getTXAction(json);
                const blind = action === "BID" && transaction_1.getBidBlind(json);
                if (blind) {
                    const bv = yield wallet.txdb.getBlind(Buffer.from(blind, "hex"));
                    json.blind = bv;
                }
                transactions.push(json);
            }
            this.transactions = transactions;
            this.pushBobMessage("");
            return this.transactions;
        });
        this.getPublicKey = (address) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            return wallet.getKey(address);
        });
        this.getCoin = (hash, index) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            return wallet.getCoin(Buffer.from(hash, "hex"), index);
        });
        this.getDomainName = (name) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const res = yield this.exec("node", "getNameInfo", name);
            const { result } = res || {};
            const { info } = result || {};
            const { owner } = info;
            const coin = yield wallet.getCoin(Buffer.from(owner.hash, "hex"), owner.index);
            return Object.assign({}, info, { owned: !!coin, ownerCovenantType: typesByVal[coin ? .covenant.type : ] });
        });
        this.getDomainNames = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { id } = opts || {};
            const walletId = id || this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            if (this.domains ? .length : ) {
                yield pushMessage({
                    type: ActionTypes.SET_DOMAIN_NAMES,
                    payload: this.domains,
                });
            }
            let domains = yield wallet.getNames();
            const latestBlock = yield this.exec("node", "getLatestBlock");
            domains = Object.keys(domains).map((name) => domains[name]);
            domains = domains.sort((a, b) => {
                if (a.renewal > b.renewal)
                    return 1;
                if (b.renewal > a.renewal)
                    return -1;
                return 0;
            });
            const result = [];
            for (let i = 0; i < domains.length; i++) {
                const domain = domains[i];
                const { owner } = domain;
                const state = domain.state(latestBlock ? .height : , this.network);
                const coin = yield wallet.getCoin(owner.hash, owner.index);
                if (!coin) {
                    continue;
                }
                if (state !== 4) {
                    continue;
                }
                result.push(Object.assign({}, domain.format(latestBlock ? .height : , this.network), { owned: !!coin, ownerCovenantType: typesByVal[coin.covenant.type] }));
            }
            this.domains = result;
            yield pushMessage({
                type: ActionTypes.SET_DOMAIN_NAMES,
                payload: this.domains,
            });
            return this.domains;
        });
        this.getBidsByName = (name) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            if (!name)
                throw new Error("name must not be empty");
            const inputNameHash = name && rules.hashName(name);
            const iter = wallet.txdb.bucket.iterator({
                gte: inputNameHash ? layout.i.min(inputNameHash) : layout.i.min(),
                lte: inputNameHash ? layout.i.max(inputNameHash) : layout.i.max(),
                values: true,
            });
            const iter2 = wallet.txdb.bucket.iterator({
                gte: inputNameHash ? layout.i.min(inputNameHash) : layout.i.min(),
                lte: inputNameHash ? layout.i.max(inputNameHash) : layout.i.max(),
                values: true,
            });
            const raws = yield iter.values();
            const keys = yield iter2.keys();
            const bids = [];
            for (let i = 0; i < raws.length; i++) {
                const raw = raws[i];
                const key = keys[i];
                const [nameHash, hash, index] = layout.i.decode(key);
                const bb = blind_bid_1.default.decode(raw);
                bb.nameHash = nameHash;
                bb.prevout = new Outpoint(hash, index);
                const bv = yield wallet.txdb.getBlind(bb.blind);
                if (bv)
                    bb.value = bv.value;
                bids.push(bb.getJSON());
            }
            return bids;
        });
        this.addNameState = (name) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const nameInfo = yield this.exec("node", "getNameInfo", name);
            if (!nameInfo || !nameInfo.result)
                throw new Error("cannot get name info");
            const ns = new NameState().fromJSON(nameInfo.result.info);
            const b = wallet.txdb.bucket.batch();
            const { nameHash } = ns;
            if (ns.isNull()) {
                b.del(layout.A.encode(nameHash));
            }
            else {
                b.put(layout.A.encode(nameHash), ns.encode());
            }
            yield b.write();
        });
        this.getNonce = (nameHash, addr, bid) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const address = Address.fromString(addr, this.network);
            const name = yield this.exec("node", "getNameByHash", nameHash);
            const nameHashBuf = Buffer.from(nameHash, "hex");
            const nonce = yield wallet.generateNonce(nameHashBuf, address, bid);
            const blind = rules.blind(bid, nonce);
            return {
                address: address.toString(this.network),
                blind: blind.toString("hex"),
                nonce: nonce.toString("hex"),
                bid: bid,
                name: name,
                nameHash: nameHash,
            };
        });
        this.importNonce = (nameHash, addr, value) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            if (!nameHash)
                throw new Error("Invalid name.");
            if (addr == null)
                throw new Error("Invalid value.");
            if (value == null)
                throw new Error("Invalid value.");
            const nameHashBuf = Buffer.from(nameHash, "hex");
            const address = Address.fromString(addr, this.network);
            const blind = yield wallet.generateBlind(nameHashBuf, address, value);
            return blind.toString("hex");
        });
        this.createWallet = (options) => __awaiter(this, void 0, void 0, function* () {
            // await this.exec('setting', 'setAnalytics', options.optIn);
            const wallet = yield this.wdb.create(options);
            const balance = yield wallet.getBalance();
            yield this.selectWallet(options.id);
            yield this.unlockWallet(options.passphrase);
            return wallet.getJSON(false, balance);
        });
        this.createWalletAccount = (accountName) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.wdb.get(this.selectedID);
            const options = {
                name: accountName,
                type: "pubkeyhash",
                passphrase: this.passphrase,
            };
            if (!wallet)
                return null;
            const result = yield wallet.createAccount(options, this.passphrase);
            // console.log("Create wallet account:", result);
            const balance = yield wallet.getBalance(result.accountIndex);
            return Object.assign({ wid: this.selectedID }, result.getJSON(balance));
        });
        this.createReveal = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { name, rate } = opts || {};
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            if (name && !rules.verifyName(name)) {
                throw new Error("Invalid name.");
            }
            const rawName = name && Buffer.from(name, "ascii");
            const inputNameHash = name && rules.hashName(rawName);
            const height = this.wdb.height + 1;
            const network = this.network;
            const iter = wallet.txdb.bucket.iterator({
                gte: inputNameHash ? layout.i.min(inputNameHash) : layout.i.min(),
                lte: inputNameHash ? layout.i.max(inputNameHash) : layout.i.max(),
                values: true,
            });
            const iter2 = wallet.txdb.bucket.iterator({
                gte: inputNameHash ? layout.i.min(inputNameHash) : layout.i.min(),
                lte: inputNameHash ? layout.i.max(inputNameHash) : layout.i.max(),
                values: true,
            });
            const raws = yield iter.values();
            const keys = yield iter2.keys();
            const bids = [];
            for (let i = 0; i < raws.length; i++) {
                const raw = raws[i];
                const key = keys[i];
                const [nameHash, hash, index] = layout.i.decode(key);
                const ns = yield wallet.getNameState(nameHash);
                if (!ns) {
                    throw new Error("Auction not found.");
                }
                ns.maybeExpire(height, network);
                const state = ns.state(height, network);
                if (state < states.REVEAL) {
                    continue;
                }
                if (state > states.REVEAL) {
                    continue;
                }
                const bb = blind_bid_1.default.decode(raw);
                bb.nameHash = nameHash;
                bb.prevout = new Outpoint(hash, index);
                const bv = yield wallet.txdb.getBlind(bb.blind);
                if (bv)
                    bb.value = bv.value;
                bids.push(bb);
            }
            const mtx = new MTX();
            for (const { prevout, own } of bids) {
                if (!own)
                    continue;
                const { hash, index } = prevout;
                const coin = yield wallet.getCoin(hash, index);
                if (!coin) {
                    continue;
                }
                if (!(yield wallet.txdb.hasCoinByAccount(0, hash, index))) {
                    continue;
                }
                const nameHash = rules.hashName(coin.covenant.items[2].toString("utf-8"));
                const ns = yield wallet.getNameState(nameHash);
                if (!ns) {
                    throw new Error("Auction not found.");
                }
                ns.maybeExpire(height, network);
                const state = ns.state(height, network);
                if (state < states.REVEAL) {
                    continue;
                }
                if (state > states.REVEAL) {
                    continue;
                }
                // Is local?
                if (coin.height < ns.height) {
                    continue;
                }
                const blind = coin.covenant.getHash(3);
                const bv = yield wallet.getBlind(blind);
                if (!bv) {
                    throw new Error("Blind value not found.");
                }
                const { value, nonce } = bv;
                const output = new Output();
                output.address = coin.address;
                output.value = value;
                output.covenant.type = types.REVEAL;
                output.covenant.pushHash(nameHash);
                output.covenant.pushU32(ns.height);
                output.covenant.pushHash(nonce);
                mtx.addOutpoint(prevout);
                mtx.outputs.push(output);
            }
            if (mtx.outputs.length === 0) {
                throw new Error("No bids to reveal.");
            }
            yield wallet.fill(mtx, rate && { rate });
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createRedeem = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { name, rate } = opts;
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            yield this.addNameState(name);
            this.wdb.height = latestBlockNow.height;
            if (!rules.verifyName(name)) {
                throw new Error("Invalid name.");
            }
            const rawName = Buffer.from(name, "ascii");
            const nameHash = rules.hashName(rawName);
            const ns = yield wallet.getNameState(nameHash);
            const height = this.wdb.height + 1;
            const network = this.network;
            if (!ns) {
                throw new Error("Auction not found.");
            }
            if (ns.isExpired(height, network)) {
                throw new Error("Name has expired!");
            }
            const state = ns.state(height, network);
            if (state < states.CLOSED) {
                throw new Error("Auction is not yet closed.");
            }
            const iter = wallet.txdb.bucket.iterator({
                gte: nameHash ? layout.B.min(nameHash) : layout.B.min(),
                lte: nameHash ? layout.B.max(nameHash) : layout.B.max(),
                values: true,
            });
            const iter2 = wallet.txdb.bucket.iterator({
                gte: nameHash ? layout.B.min(nameHash) : layout.B.min(),
                lte: nameHash ? layout.B.max(nameHash) : layout.B.max(),
                values: true,
            });
            const raws = yield iter.values();
            const keys = yield iter2.keys();
            const reveals = [];
            for (let i = 0; i < raws.length; i++) {
                const raw = raws[i];
                const key = keys[i];
                const [nameHash, hash, index] = layout.B.decode(key);
                const brv = bid_reveal_1.default.decode(raw);
                brv.nameHash = nameHash;
                brv.prevout = new Outpoint(hash, index);
                reveals.push(brv);
            }
            const mtx = new MTX();
            for (const { prevout, own } of reveals) {
                if (!own)
                    continue;
                // Winner can not redeem
                if (prevout.equals(ns.owner))
                    continue;
                const { hash, index } = prevout;
                const coin = yield wallet.getCoin(hash, index);
                if (!coin) {
                    continue;
                }
                if (!(yield wallet.txdb.hasCoinByAccount(0, hash, index))) {
                    continue;
                }
                // Is local?
                if (coin.height < ns.height) {
                    continue;
                }
                mtx.addOutpoint(prevout);
                const output = new Output();
                output.address = coin.address;
                output.value = coin.value;
                output.covenant.type = types.REDEEM;
                output.covenant.pushHash(nameHash);
                output.covenant.pushU32(ns.height);
                mtx.outputs.push(output);
            }
            if (mtx.outputs.length === 0) {
                throw new Error("No reveals to redeem.");
            }
            yield wallet.fill(mtx, rate && { rate });
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createRegister = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { name, data, rate } = opts;
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const resource = Resource.fromJSON(data);
            if (!rules.verifyName(name))
                throw new Error("Invalid name.");
            const rawName = Buffer.from(name, "ascii");
            const nameHash = rules.hashName(rawName);
            const ns = yield wallet.getNameState(nameHash);
            const height = this.wdb.height + 1;
            const network = this.network;
            if (!ns)
                throw new Error("Auction not found.");
            const { hash, index } = ns.owner;
            const coin = yield wallet.getCoin(hash, index);
            if (!coin)
                throw new Error("Wallet did not win the auction.");
            if (ns.isExpired(height, network))
                throw new Error("Name has expired!");
            // Is local?
            if (coin.height < ns.height)
                throw new Error("Wallet did not win the auction.");
            if (!coin.covenant.isReveal() && !coin.covenant.isClaim())
                throw new Error("Name must be in REVEAL or CLAIM state.");
            if (coin.covenant.isClaim()) {
                if (height < coin.height + network.coinbaseMaturity)
                    throw new Error("Claim is not yet mature.");
            }
            const state = ns.state(height, network);
            if (state !== states.CLOSED)
                throw new Error("Auction is not yet closed.");
            const output = new Output();
            output.address = coin.address;
            output.value = ns.value;
            output.covenant.type = types.REGISTER;
            output.covenant.pushHash(nameHash);
            output.covenant.pushU32(ns.height);
            if (resource) {
                const raw = resource.encode();
                if (raw.length > rules.MAX_RESOURCE_SIZE)
                    throw new Error("Resource exceeds maximum size.");
                output.covenant.push(raw);
            }
            else {
                output.covenant.push(Buffer.alloc(0));
            }
            let renewalHeight = height - this.network.names.renewalMaturity * 2;
            if (height < 0)
                renewalHeight = 0;
            const renewalBlock = yield this.exec("node", "getBlockByHeight", renewalHeight);
            output.covenant.pushHash(Buffer.from(renewalBlock.hash, "hex"));
            const mtx = new MTX();
            mtx.addOutpoint(ns.owner);
            mtx.outputs.push(output);
            yield wallet.fill(mtx, rate && { rate: rate });
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createUpdate = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { name, data, rate } = opts;
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            yield this.addNameState(name);
            const resource = Resource.fromJSON(data);
            if (!rules.verifyName(name))
                throw new Error("Invalid name.");
            const rawName = Buffer.from(name, "ascii");
            const nameHash = rules.hashName(rawName);
            const ns = yield wallet.getNameState(nameHash);
            const height = this.wdb.height + 1;
            const network = this.network;
            if (!ns)
                throw new Error("Auction not found.");
            const { hash, index } = ns.owner;
            const coin = yield wallet.getCoin(hash, index);
            if (!coin)
                throw new Error(`Wallet does not own: "${name}".`);
            if (!(yield wallet.txdb.hasCoinByAccount(0, hash, index)))
                throw new Error(`Account does not own: "${name}".`);
            if (coin.covenant.isReveal() || coin.covenant.isClaim())
                return this.createRegister(opts);
            if (ns.isExpired(height, network))
                throw new Error("Name has expired!");
            // Is local?
            if (coin.height < ns.height)
                throw new Error(`Wallet does not own: "${name}".`);
            const state = ns.state(height, network);
            if (state !== states.CLOSED)
                throw new Error("Auction is not yet closed.");
            if (!coin.covenant.isRegister() &&
                !coin.covenant.isUpdate() &&
                !coin.covenant.isRenew() &&
                !coin.covenant.isFinalize()) {
                throw new Error("Name must be registered.");
            }
            const raw = resource.encode();
            if (raw.length > rules.MAX_RESOURCE_SIZE)
                throw new Error("Resource exceeds maximum size.");
            const output = new Output();
            output.address = coin.address;
            output.value = coin.value;
            output.covenant.type = types.UPDATE;
            output.covenant.pushHash(nameHash);
            output.covenant.pushU32(ns.height);
            output.covenant.push(raw);
            const mtx = new MTX();
            mtx.addOutpoint(ns.owner);
            mtx.outputs.push(output);
            yield wallet.fill(mtx, rate && { rate: rate });
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createOpen = (opts) => __awaiter(this, void 0, void 0, function* () {
            const { name, rate } = opts;
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            if (!rules.verifyName(name))
                throw new Error("Invalid name.");
            const rawName = Buffer.from(name, "ascii");
            const nameHash = rules.hashName(rawName);
            const height = this.wdb.height + 1;
            const network = this.network;
            if (rules.isReserved(nameHash, height, network))
                throw new Error("Name is reserved.");
            if (!rules.hasRollout(nameHash, height, network))
                throw new Error("Name not yet available.");
            const nameInfo = yield this.exec("node", "getNameInfo", name);
            if (!nameInfo || !nameInfo.result)
                throw new Error("cannot get name info");
            if (nameInfo.result.info) {
                throw new Error("Name is already opened.");
            }
            yield this.exec("node", "addNameHash", name, nameHash.toString("hex"));
            const addr = yield wallet.receiveAddress(0);
            const output = new Output();
            output.address = addr;
            output.value = 0;
            output.covenant.type = types.OPEN;
            output.covenant.pushHash(nameHash);
            output.covenant.pushU32(0);
            output.covenant.push(rawName);
            const mtx = new MTX();
            mtx.outputs.push(output);
            if (yield wallet.txdb.isDoubleOpen(mtx))
                throw new Error(`Already sent an open for: ${name}.`);
            yield wallet.fill(mtx, rate && { rate: rate });
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createBid = (opts) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            yield this.addNameState(opts.name);
            const createdTx = yield wallet.createBid(opts.name, +number_1.toDollaryDoos(opts.amount), +number_1.toDollaryDoos(opts.lockup), opts.feeRate && {
                rate: opts.feeRate,
            });
            return createdTx.toJSON();
        });
        this.createTx = (txOptions) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            const mtx = MTX.fromJSON(txOptions);
            yield wallet.fill(mtx);
            const createdTx = yield wallet.finalize(mtx);
            return createdTx.toJSON();
        });
        this.createSend = (txOptions) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            this.wdb.height = latestBlockNow.height;
            const createdTx = yield wallet.createTX(txOptions);
            return createdTx.toJSON();
        });
        this.updateTxFromQueue = (opts) => __awaiter(this, void 0, void 0, function* () {
            let txQueue = (yield get(this.store, `tx_queue_${this.selectedID}`)) || [];
            txQueue = txQueue.map((tx) => {
                if (tx.hash === opts.oldJSON.hash) {
                    return opts.txJSON;
                }
                else {
                    return tx;
                }
            });
            yield put(this.store, `tx_queue_${this.selectedID}`, txQueue);
            yield this.updateTxQueue();
        });
        this.addTxToQueue = (txJSON) => __awaiter(this, void 0, void 0, function* () {
            const txQueue = (yield get(this.store, `tx_queue_${this.selectedID}`)) || [];
            if (!txQueue.filter((tx) => tx.hash === txJSON.hash)[0]) {
                txQueue.push(txJSON);
            }
            yield put(this.store, `tx_queue_${this.selectedID}`, txQueue);
            yield this.updateTxQueue();
        });
        this.removeTxFromQueue = (txJSON) => __awaiter(this, void 0, void 0, function* () {
            let txQueue = (yield get(this.store, `tx_queue_${this.selectedID}`)) || [];
            txQueue = txQueue.filter((tx) => tx.hash !== txJSON.hash);
            yield put(this.store, `tx_queue_${this.selectedID}`, txQueue);
            yield this.updateTxQueue();
        });
        this.getTxQueue = (id) => __awaiter(this, void 0, void 0, function* () {
            const walletId = id || this.selectedID;
            const txQueue = (yield get(this.store, `tx_queue_${walletId}`)) || [];
            yield this._addOutputPathToTxQueue(txQueue);
            return txQueue;
        });
        this.rejectTx = (txJSON) => __awaiter(this, void 0, void 0, function* () {
            yield this.removeTxFromQueue(txJSON);
            // this.emit('txRejected', txJSON);
            const action = transaction_1.getTXAction(txJSON);
            // this.exec('analytics', 'track', {
            //   name: 'Reject',
            //   data: {
            //     action,
            //   },
            // });
        });
        this.submitTx = (opts) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            // const action = getTXAction(opts.txJSON);
            // this.exec('analytics', 'track', {
            //   name: 'Submit',
            //   data: {
            //     action,
            //   },
            // });
            let returnValue;
            if (opts.txJSON.method === SIGN_MESSAGE_WITH_NAME_METHOD) {
                returnValue = yield this.signMessageWithName(opts.txJSON.data.name, opts.txJSON.data.message);
            }
            if (opts.txJSON.method === SIGN_MESSAGE_METHOD) {
                returnValue = yield this.signMessage(opts.txJSON.data.address, opts.txJSON.data.message);
            }
            if (!opts.txJSON.method) {
                const latestBlockNow = yield this.exec("node", "getLatestBlock");
                this.wdb.height = latestBlockNow.height;
                const mtx = MTX.fromJSON(opts.txJSON);
                const tx = yield wallet.sendMTX(mtx, this.passphrase);
                yield this.exec("node", "sendRawTransaction", tx.toHex());
                returnValue = tx.getJSON(this.network);
            }
            yield this.removeTxFromQueue(opts.txJSON);
            // this.emit('txAccepted', returnValue);
            return returnValue;
        });
        this.updateTxQueue = () => __awaiter(this, void 0, void 0, function* () {
            if (this.selectedID) {
                const txQueue = yield get(this.store, `tx_queue_${this.selectedID}`);
                yield this._addOutputPathToTxQueue(txQueue);
                yield pushMessage({
                    type: QueueActionType.SET_TX_QUEUE,
                    payload: txQueue || [],
                });
                return;
            }
            yield pushMessage({
                type: QueueActionType.SET_TX_QUEUE,
                payload: [],
            });
        });
        this.insertTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
            transactions = transactions.sort((a, b) => {
                if (a.height > b.height)
                    return 1;
                if (b.height > a.height)
                    return -1;
                if (a.index > b.index)
                    return 1;
                if (b.index > a.index)
                    return -1;
                return 0;
            });
            const txMap = {};
            transactions = transactions.reduce((acc, tx) => {
                if (txMap[tx.hash])
                    return acc;
                txMap[tx.hash] = tx.hash;
                acc.push(tx);
                return acc;
            }, []);
            yield this.pushBobMessage(`Found ${transactions.length} transaction.`);
            let retries = 0;
            for (let i = 0; i < transactions.length; i++) {
                if (this.forceStopRescan) {
                    this.forceStopRescan = false;
                    this.rescanning = false;
                    yield this.pushState();
                    throw new Error("rescan stopped.");
                }
                const unlock = yield this.wdb.txLock.lock();
                try {
                    const tx = mapOneTx(transactions[i]);
                    const wallet = yield this.wdb.get(this.selectedID);
                    const wtx = yield wallet.getTX(Buffer.from(transactions[i].hash, "hex"));
                    yield this.pushBobMessage(`Inserting TX # ${i} of ${transactions.length}....`);
                    if (wtx && wtx.height > 0) {
                        continue;
                    }
                    if (transactions[i].height <= 0) {
                        continue;
                    }
                    const entryOption = yield this.exec("node", "getBlockEntry", transactions[i].height);
                    const entry = new ChainEntry(Object.assign({}, entryOption, { version: Number(entryOption.version), hash: Buffer.from(entryOption.hash, "hex"), prevBlock: Buffer.from(entryOption.prevBlock, "hex"), merkleRoot: Buffer.from(entryOption.merkleRoot, "hex"), witnessRoot: Buffer.from(entryOption.witnessRoot, "hex"), treeRoot: Buffer.from(entryOption.treeRoot, "hex"), reservedRoot: Buffer.from(entryOption.reservedRoot, "hex"), extraNonce: Buffer.from(entryOption.extraNonce, "hex"), mask: Buffer.from(entryOption.mask, "hex"), chainwork: entryOption.chainwork && BN.from(entryOption.chainwork, 16, "be") }));
                    yield this.wdb._addTX(tx, entry);
                    retries = 0;
                }
                catch (e) {
                    retries++;
                    yield new Promise((r) => setTimeout(r, 10));
                    if (retries > 10000) {
                        throw e;
                    }
                    i = Math.max(i - 2, 0);
                }
                finally {
                    yield unlock();
                }
            }
        });
        this.hasAddress = (address) => __awaiter(this, void 0, void 0, function* () {
            if (!address) {
                return false;
            }
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            try {
                const key = yield wallet.getKey(Address.from(address));
                return !!key;
            }
            catch (e) {
                return false;
            }
        });
        this.createSignMessageRequest = (message, address, name) => __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            if (typeof address === "string") {
                return {
                    hash: crypto
                        .createHash("sha256")
                        .update(Buffer.from(address + message + Date.now()).toString("hex"))
                        .digest("hex"),
                    method: SIGN_MESSAGE_METHOD,
                    walletId: walletId,
                    data: {
                        address,
                        message,
                    },
                    bid: undefined,
                    height: 0,
                };
            }
            if (typeof name === "string") {
                return {
                    hash: crypto
                        .createHash("sha256")
                        .update(Buffer.from(name + message + Date.now()).toString("hex"))
                        .digest("hex"),
                    method: SIGN_MESSAGE_WITH_NAME_METHOD,
                    walletId: walletId,
                    data: {
                        name,
                        message,
                    },
                    bid: undefined,
                    height: 0,
                };
            }
            throw new Error("name or address must be present");
        });
        this.signMessage = (address, msg) => __awaiter(this, void 0, void 0, function* () {
            if (!address || !msg) {
                throw new Error("Requires parameters address of type string and msg of type string.");
            }
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            try {
                yield wallet.unlock(this.passphrase, 60000);
                const key = yield wallet.getKey(Address.from(address));
                if (!key) {
                    throw new Error("Address not found.");
                }
                if (!wallet.master.key) {
                    throw new Error("Wallet is locked");
                }
                const _msg = Buffer.from(MAGIC_STRING + msg, "utf8");
                const hash = blake2b.digest(_msg);
                const sig = key.sign(hash);
                return sig.toString("base64");
            }
            finally {
                yield wallet.lock();
            }
        });
        this.signMessageWithName = (name, msg) => __awaiter(this, void 0, void 0, function* () {
            if (!name || !msg) {
                throw new Error("Requires parameters name of type string and msg of type string.");
            }
            else if (!rules.verifyName(name)) {
                throw new Error("Requires valid name per Handshake protocol rules.");
            }
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            try {
                yield wallet.unlock(this.passphrase, 60000);
                const ns = yield wallet.getNameStateByName(name);
                if (!ns || !ns.owner) {
                    throw new Error("Cannot find the name owner.");
                }
                const coin = yield wallet.getCoin(ns.owner.hash, ns.owner.index);
                if (!coin) {
                    throw new Error("Cannot find the address of the name owner.");
                }
                const address = coin.address.toString(this.network);
                return this.signMessage(address, msg);
            }
            finally {
                yield wallet.lock();
            }
        });
        this.getAllReceiveTXs = (startBlock, endBlock, startDepth = 0, endDepth = LOOKAHEAD, transactions = []) => __awaiter(this, void 0, void 0, function* () {
            yield this.pushBobMessage(`Scanning receive depth ${startDepth}-${endDepth}...`);
            const addresses = yield this.genAddresses(startDepth, endDepth, "receive");
            const newTXs = yield this.exec("node", "getTXByAddresses", addresses, startBlock, endBlock);
            if (!newTXs.length) {
                return transactions;
            }
            transactions = transactions.concat(newTXs);
            return yield this.getAllReceiveTXs(startBlock, endBlock, startDepth + LOOKAHEAD, endDepth + LOOKAHEAD, transactions);
        });
        this.getAllChangeTXs = (startBlock, endBlock, startDepth = 0, endDepth = LOOKAHEAD, transactions = []) => __awaiter(this, void 0, void 0, function* () {
            yield this.pushBobMessage(`Scanning change depth ${startDepth}-${endDepth}...`);
            const addresses = yield this.genAddresses(startDepth, endDepth, "change");
            const newTXs = yield this.exec("node", "getTXByAddresses", addresses, startBlock, endBlock);
            if (!newTXs.length) {
                return transactions;
            }
            transactions = transactions.concat(newTXs);
            return yield this.getAllChangeTXs(startBlock, endBlock, startDepth + LOOKAHEAD, endDepth + LOOKAHEAD, transactions);
        });
        this.stopRescan = () => __awaiter(this, void 0, void 0, function* () {
            this.forceStopRescan = true;
            this.rescanning = false;
            this.pushState();
        });
        this.fullRescan = (start = 0) => __awaiter(this, void 0, void 0, function* () {
            this.rescanning = true;
            this.pushState();
            yield this.pushBobMessage("Start rescanning...");
            const latestBlockEnd = yield this.exec("node", "getLatestBlock");
            const changeTXs = yield this.getAllChangeTXs(start, latestBlockEnd.height);
            const receiveTXs = yield this.getAllReceiveTXs(start, latestBlockEnd.height);
            const transactions = receiveTXs.concat(changeTXs);
            yield this.wdb.watch();
            yield this.insertTransactions(transactions);
            yield put(this.store, `latest_block_${this.selectedID}`, latestBlockEnd);
            this.rescanning = false;
            this.pushState();
            yield this.pushBobMessage("");
            return;
        });
        this.processBlock = (blockHeight) => __awaiter(this, void 0, void 0, function* () {
            yield this.pushBobMessage(`Fetching block # ${blockHeight}....`);
            const _a = yield this.exec("node", "getBlockByHeight", blockHeight), { txs: transactions } = _a, entryOption = __rest(_a, ["txs"]);
            yield this.pushBobMessage(`Processing block # ${entryOption.height}....`);
            let retries = 0;
            for (let i = 0; i < transactions.length; i++) {
                const unlock = yield this.wdb.txLock.lock();
                try {
                    const tx = mapOneTx(transactions[i]);
                    const wallet = yield this.wdb.get(this.selectedID);
                    const wtx = yield wallet.getTX(Buffer.from(transactions[i].hash, "hex"));
                    if (wtx && wtx.height > 0) {
                        continue;
                    }
                    const entry = new ChainEntry(Object.assign({}, entryOption, { version: Number(entryOption.version), hash: Buffer.from(entryOption.hash, "hex"), prevBlock: Buffer.from(entryOption.prevBlock, "hex"), merkleRoot: Buffer.from(entryOption.merkleRoot, "hex"), witnessRoot: Buffer.from(entryOption.witnessRoot, "hex"), treeRoot: Buffer.from(entryOption.treeRoot, "hex"), reservedRoot: Buffer.from(entryOption.reservedRoot, "hex"), extraNonce: Buffer.from(entryOption.extraNonce, "hex"), mask: Buffer.from(entryOption.mask, "hex"), chainwork: entryOption.chainwork && BN.from(entryOption.chainwork, 16, "be") }));
                    yield this.wdb._addTX(tx, entry);
                    retries = 0;
                }
                catch (e) {
                    retries++;
                    yield new Promise((r) => setTimeout(r, 10));
                    if (retries > 10000) {
                        throw e;
                    }
                    i = Math.max(i - 2, 0);
                }
                finally {
                    yield unlock();
                }
            }
            yield put(this.store, `latest_block_${this.selectedID}`, {
                hash: entryOption.hash,
                height: entryOption.height,
                time: entryOption.time,
            });
        });
        this.rescanBlocks = (startHeight, endHeight) => __awaiter(this, void 0, void 0, function* () {
            for (let i = startHeight; i <= endHeight; i++) {
                if (this.forceStopRescan) {
                    this.forceStopRescan = false;
                    this.rescanning = false;
                    yield this.pushState();
                    throw new Error("rescan stopped.");
                }
                yield this.processBlock(i);
            }
        });
        this.checkForRescan = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.selectedID || this.rescanning || this.locked)
                return;
            this.rescanning = true;
            yield this.pushState();
            yield this.pushBobMessage("Checking status...");
            const latestBlockNow = yield this.exec("node", "getLatestBlock");
            const latestBlockLast = yield get(this.store, `latest_block_${this.selectedID}`);
            try {
                if (latestBlockLast && latestBlockLast.height >= latestBlockNow.height) {
                    yield this.pushBobMessage("I am synchronized.");
                }
                else if (latestBlockLast &&
                    latestBlockNow.height - latestBlockLast.height <= 100) {
                    yield this.rescanBlocks(latestBlockLast.height + 1, latestBlockNow.height);
                }
                else {
                    yield this.fullRescan(0);
                }
                this.rescanning = false;
                yield this.pushState();
                yield this.pushBobMessage(`I am synchonized.`);
            }
            catch (e) {
                console.error(e);
                this.rescanning = false;
                yield this.pushState();
                yield this.pushBobMessage(`Something went wrong while rescanning.`);
            }
            finally {
                yield pushMessage({
                    type: ActionType.SET_TRANSACTIONS,
                    payload: yield this.getTransactions(),
                });
            }
        });
        this.selectedID = "";
        this.selectedAccount = "default";
        this.locked = true;
        this.rescanning = false;
        this.watchOnly = false;
        this.forceStopRescan = false;
        this._getTxNonce = 0;
        this._getNameNonce = 0;
        this.nodeService = node_1.default;
    }
    generateNewMnemonic() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Mnemonic({ bits: 256 }).getPhrase().trim();
        });
    }
    _addOutputPathToTxQueue(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < queue.length; i++) {
                const tx = queue[i];
                if (tx.method) {
                    continue;
                }
                if (!tx.method) {
                    for (let outputIndex = 0; outputIndex < tx.outputs.length; outputIndex++) {
                        const output = tx.outputs[outputIndex];
                        output.owned = yield this.hasAddress(output.address);
                    }
                }
            }
            return queue;
        });
    }
    _addPrevoutCoinToPending(pending) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            for (let i = 0; i < pending.length; i++) {
                const tx = pending[i];
                for (let inputIndex = 0; inputIndex < tx.inputs.length; inputIndex++) {
                    const input = tx.inputs[inputIndex];
                    const coin = yield wallet.getCoin(input.prevout.hash, input.prevout.index);
                    input.coin = coin.getJSON(this.network);
                }
            }
            return pending;
        });
    }
    shouldContinue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.forceStopRescan) {
                this.forceStopRescan = false;
                this.rescanning = false;
                yield this.pushState();
                throw new Error("rescan stopped.");
            }
        });
    }
    genAddresses(startDepth, endDepth, changeOrReceive) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletId = this.selectedID;
            const wallet = yield this.wdb.get(walletId);
            const account = yield wallet.getAccount("default");
            const addresses = [];
            let b;
            for (let i = startDepth; i < endDepth; i++) {
                yield this.shouldContinue();
                const key = changeOrReceive === "change"
                    ? account.deriveChange(i)
                    : account.deriveReceive(i);
                const receive = key.getAddress().toString(this.network);
                const path = key.toPath();
                if (!(yield this.wdb.hasPath(account.wid, path.hash))) {
                    b = b || this.wdb.db.batch();
                    yield this.wdb.savePath(b, account.wid, path);
                }
                addresses.push(receive);
            }
            if (b) {
                yield b.write();
            }
            return addresses;
        });
    }
    initPoller() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pollerTimeout) {
                clearInterval(this.pollerTimeout);
            }
            return setInterval(() => (() => __awaiter(this, void 0, void 0, function* () {
                yield this.checkForRescan();
                const { hash, height, time } = yield this.exec("node", "getLatestBlock");
                yield pushMessage(setInfo(hash, height, time));
                // this.emit('newBlock', { hash, height, time });
            }))(), ONE_MINUTE);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.network = Network.get(networkType);
            this.wdb = new WalletDB({
                network: this.network,
                memory: false,
                location: this.network.type === "main"
                    ? "/walletdb"
                    : `/${this.network}/walletdb`,
                cacheSize: 512 << 20,
                maxFileSize: 256 << 20,
            });
            this.store = bdb.create("/wallet-store");
            this.wdb.on("error", (err) => console.error("wdb error", err));
            yield this.wdb.open();
            yield this.store.open();
            if (!this.selectedID) {
                const walletIDs = yield this.getWalletIDs();
                this.selectedID = walletIDs.filter((id) => id !== "primary")[0];
            }
            this.checkForRescan();
            this.pollerTimeout = this.initPoller();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pollerTimeout) {
                clearInterval(this.pollerTimeout);
            }
        });
    }
}
function mapOneTx(txOptions) {
    if (txOptions.witnessHash) {
        txOptions.witnessHash = Buffer.from(txOptions.witnessHash, "hex");
    }
    txOptions.inputs = txOptions.inputs.map((input) => {
        if (input.prevout.hash) {
            input.prevout.hash = Buffer.from(input.prevout.hash, "hex");
        }
        if (input.coin && input.coin.covenant) {
            input.coin.covenant = new Covenant(input.coin.covenant.type, input.coin.covenant.items.map((item) => Buffer.from(item, "hex")));
        }
        if (input.witness) {
            input.witness = input.witness.map((wit) => Buffer.from(wit, "hex"));
        }
        return input;
    });
    txOptions.outputs = txOptions.outputs.map((output) => {
        if (output.covenant) {
            output.covenant = new Covenant(output.covenant.type, output.covenant.items.map((item) => Buffer.from(item, "hex")));
        }
        return output;
    });
    const tx = new TX(txOptions);
    return tx;
}
exports.default = WalletService;
//# sourceMappingURL=index.js.map