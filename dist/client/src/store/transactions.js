"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    StateCreator;
}
from;
'zustand';
{
    Covenant;
}
from;
'@/utils/covenant';
exports.createTransactionsSlice = (set, get) => ({
    pending: [],
    order: [],
    map: {},
    offset: 20,
    fetching: false,
    fetchTransactions: () => {
        // const state = getState();
        // const { fetching } = state.transactions;
        // if (fetching) return;
        // dispatch(setFetching(true));
        // const resp = await postMessage({
        //   type: MessageTypes.GET_TRANSACTIONS,
        // });
        // dispatch({
        //   type: ActionType.SET_TRANSACTIONS,
        //   payload: resp,
        // });
        // dispatch(setFetching(false));
    },
    fetchPendingTransactions: () => {
        // const pendingTXs = await postMessage({
        //   type: MessageTypes.GET_PENDING_TRANSACTIONS,
        // });
        // dispatch({
        //   type: ActionType.SET_PENDING_TRANSACTIONS,
        //   payload: pendingTXs,
        // });
    },
    setFetching: (fetching) => {
        set({ fetching });
    },
    setOffset: (offset) => {
        set({ offset });
    },
    setBlindHash: (blind, hash) => {
        console.log(blind, hash);
        // set({
        //   map: {
        //     [hash]: {
        //       blind: blind,
        //     },
        //   },
        // });
    },
    resetTransactions: () => {
        get().setOffset(20);
        get().setTransactions([]);
    },
    setTransactions: (transactions) => {
        set({
            order: transactions.map((tx) => tx.hash),
        });
    },
});
//# sourceMappingURL=transactions.js.map