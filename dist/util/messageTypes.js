"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageTypes;
(function (MessageTypes) {
    // wallet
    MessageTypes["ADD_TX_QUEUE"] = "add_tx_queue";
    MessageTypes["CHECK_FOR_RESCAN"] = "check_for_rescan";
    MessageTypes["CREATE_BID"] = "create_bid";
    MessageTypes["CREATE_NEW_WALLET"] = "create_new_wallet";
    MessageTypes["CREATE_NEW_WALLET_ACCOUNT"] = "create_new_wallet_account";
    MessageTypes["CREATE_OPEN"] = "create_open";
    MessageTypes["CREATE_REDEEM"] = "create_redeem";
    MessageTypes["CREATE_REVEAL"] = "create_reveal";
    MessageTypes["CREATE_SEND"] = "create_send";
    MessageTypes["CREATE_TX"] = "create_tx";
    MessageTypes["CREATE_UPDATE"] = "create_update";
    MessageTypes["FULL_RESCAN"] = "full_rescan";
    MessageTypes["GENERATE_NEW_MNEMONIC"] = "generate_new_mnemonic";
    MessageTypes["GET_ACCOUNT_INFO"] = "get_account_info";
    MessageTypes["GET_ACCOUNT_KEY"] = "get_account_key";
    MessageTypes["GET_ACCOUNTS_INFO"] = "get_accounts_info";
    MessageTypes["GET_ACCOUNT_NAMES"] = "get_account_names";
    MessageTypes["GET_BIDS_BY_NAME"] = "get_bids_by_name";
    MessageTypes["GET_COIN"] = "get_coin";
    MessageTypes["GET_DOMAIN_NAME"] = "get_domain_name";
    MessageTypes["GET_DOMAIN_NAMES"] = "get_domain_names";
    MessageTypes["GET_NAME_NONCE"] = "get_name_nonce";
    MessageTypes["GET_NONCE"] = "get_nonce";
    MessageTypes["GET_PENDING_TRANSACTIONS"] = "get_pending_transactions";
    MessageTypes["GET_TRANSACTIONS"] = "get_transactions";
    MessageTypes["GET_TX_NONCE"] = "get_tx_nonce";
    MessageTypes["GET_TX_QUEUE"] = "get_tx_queue";
    MessageTypes["GET_WALLETS_INFO"] = "get_wallets_info";
    MessageTypes["GET_WALLET_BALANCE"] = "get_wallet_balance";
    MessageTypes["GET_WALLET_IDS"] = "get_wallet_ids";
    MessageTypes["GET_WALLET_INFO"] = "get_wallet_info";
    MessageTypes["GET_WALLET_RECEIVE_ADDRESS"] = "get_wallet_receive_address";
    MessageTypes["GET_WALLET_STATE"] = "get_wallet_state";
    MessageTypes["IMPORT_NONCE"] = "import_nonce";
    MessageTypes["LEDGER_PROXY"] = "_ledgerProxy";
    MessageTypes["LOCK_WALLET"] = "lock_wallet";
    MessageTypes["REJECT_TX"] = "reject_tx";
    MessageTypes["REMOVE_TX_FROM_QUEUE"] = "removeTxFromQueue";
    MessageTypes["RENAME_ACCOUNT"] = "renameAccount";
    MessageTypes["RESET_DOMAINS"] = "reset_domains";
    MessageTypes["RESET_TRANSACTIONS"] = "reset_transactions";
    MessageTypes["REVEAL_SEED"] = "reveal_seed";
    MessageTypes["SELECT_ACCOUNT"] = "select_account";
    MessageTypes["SELECT_WALLET"] = "select_wallet";
    MessageTypes["SIGN_MESSAGE"] = "signMessage";
    MessageTypes["SIGN_MESSAGE_WITH_NAME"] = "signMessageWithName";
    MessageTypes["STOP_RESCAN"] = "stop_rescan";
    MessageTypes["SUBMIT_TX"] = "submit_tx";
    MessageTypes["UNLOCK_WALLET"] = "unlock_wallet";
    MessageTypes["UPDATE_TX_FROM_QUEUE"] = "updateTxFromQueue";
    MessageTypes["UPDATE_TX_QUEUE"] = "update_tx_queue";
    MessageTypes["USE_LEDGER_PROXY"] = "use_ledger_proxy";
    // node
    MessageTypes["ESTIMATE_SMART_FEE"] = "estimate_smart_fee";
    MessageTypes["GET_LATEST_BLOCK"] = "get_latest_block";
    MessageTypes["GET_NAME_BY_HASH"] = "get_name_by_hash";
    MessageTypes["GET_NAME_RESOURCE"] = "get_name_resource";
    MessageTypes["HASH_NAME"] = "hashName";
    MessageTypes["VERIFY_MESSAGE"] = "verifyMessage";
    MessageTypes["VERIFY_MESSAGE_WITH_NAME"] = "verifyMessageWithName";
    // settings
    MessageTypes["GET_ANALYTICS"] = "getAnalytics";
    MessageTypes["GET_API"] = "get_api";
    MessageTypes["GET_RESOLVE_HNS"] = "getResolveHns";
    MessageTypes["SET_ANALYTICS"] = "setAnalytics";
    MessageTypes["SET_RESOLVE_HNS"] = "setResolveHns";
    MessageTypes["SET_RPC_HOST"] = "set_rpc_host";
    MessageTypes["SET_RPC_KEY"] = "set_rpc_key";
    // analytics
    MessageTypes["MP_TRACK"] = "mp_track";
    // SQL
    MessageTypes["READ_DB_AS_BUFFER"] = "read_db_as_buffer";
    MessageTypes["RESET_DB"] = "reset_db";
    // Bob3
    MessageTypes["CONNECT"] = "connect";
    MessageTypes["DISCONNECTED"] = "disconnected";
    MessageTypes["NEW_BLOCK"] = "new_block";
    MessageTypes["SEND_BID"] = "send_bid";
    MessageTypes["SEND_OPEN"] = "send_open";
    MessageTypes["SEND_REDEEM"] = "send_redeem";
    MessageTypes["SEND_REVEAL"] = "send_reveal";
    MessageTypes["SEND_TX"] = "send_tx";
    MessageTypes["SEND_UPDATE"] = "send_update";
    // Torrent
    MessageTypes["CHECK_TORRENT"] = "torrent/check";
    MessageTypes["CONSUME_TORRENT"] = "torrent/consume";
    MessageTypes["CLEAR_TORRENT"] = "torrent/clear";
    MessageTypes["OPEN_FEDERALIST"] = "federalist/open";
})(MessageTypes || (MessageTypes = {}));
exports.default = MessageTypes;
//# sourceMappingURL=messageTypes.js.map