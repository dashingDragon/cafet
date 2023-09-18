import { HttpsCallableResult, connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { MakeTransactionPayload, TransactionOrder } from './transactions';
import { Account, MakeAccountPayload, SetFavoritesPayload } from './accounts';
import logger from './logger';

const LOCAL_FUNCTIONS = true;

export const useMakeAccount = () => {
    const functions = getFunctions();
    if (LOCAL_FUNCTIONS) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    const fun = httpsCallable(functions, 'makeAccount') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean }>>;

    return async (payload: MakeAccountPayload): Promise<HttpsCallableResult<{ success: boolean }>> => {
        logger.log('Called function makeAccount');
        try {
            return await fun(payload);
        } catch (e) {
            logger.error('makeAccount failed : '  + e);
            return { data: { success: false } };
        }
    };
};

/**
 * Write a transaction for the exchange and update
 * the account's balance and stats.
 *
 * @returns a google cloud function to make the transation
 */
export const useMakeTransaction = () => {
    const functions = getFunctions();
    if (LOCAL_FUNCTIONS) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    const fun = httpsCallable(functions, 'makeTransaction') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean }>>;

    return async (payload: MakeTransactionPayload): Promise<HttpsCallableResult<{ success: boolean }>> => {
        logger.log('Called function makeTransaction with payload');
        logger.log(payload);
        try {
            return await fun(payload);
        } catch (e) {
            logger.error('makeTransaction failed : '  + e);
            return { data: { success: false } };
        }
    };
};

export const useGetFirestoreUser = () => {
    const functions = getFunctions();
    if (LOCAL_FUNCTIONS) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    const fun = httpsCallable(functions, 'getFirestoreUser') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean, account: Account | undefined }>>;

    return async (): Promise<HttpsCallableResult<{ success: boolean, account: Account | undefined }>> => {
        logger.log('Called function getFirestoreUser');
        try {
            return await fun();
        } catch (e) {
            logger.error('getFirestoreUser failed : '  + e);
            return { data: { success: false, account: undefined } };
        }
    };
};

export const useOrderHistory = () => {
    const functions = getFunctions();
    if (LOCAL_FUNCTIONS) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    const fun = httpsCallable(functions, 'getOrderHistory') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean, orders: TransactionOrder[] | undefined }>>;

    return async (): Promise<HttpsCallableResult<{ success: boolean, orders: TransactionOrder[] | undefined }>> => {
        logger.log('Called function getOrderHistory');
        try {
            return await fun();
        } catch (e) {
            logger.error('getOrderHistory failed : '  + e);
            return { data: { success: false, orders: undefined } };
        }
    };
};

export const useSetFavorites = () => {
    const functions = getFunctions();
    if (LOCAL_FUNCTIONS) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    const fun = httpsCallable(functions, 'setFavorites') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean }>>;

    return async (payload: SetFavoritesPayload): Promise<HttpsCallableResult<{ success: boolean }>> => {
        logger.log('Called function setFavorites');
        try {
            return await fun(payload);
        } catch (e) {
            console.error('setFavorites failed : '  + e);
            return { data: { success: false } };
        }
    };
};