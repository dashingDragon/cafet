import { HttpsCallableResult, getFunctions, httpsCallable } from 'firebase/functions';
import { useState } from 'react';
import { MakeTransactionPayload } from './transactions';
import { Account, MakeAccountPayload } from './accounts';

export const useMakeAccount = () => {
    const functions = getFunctions();
    const fun = httpsCallable(functions, 'makeAccount') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean }>>;

    return async (payload: MakeAccountPayload): Promise<HttpsCallableResult<{ success: boolean }>> => {
        console.log('Called function makeAccount');
        try {
            return await fun(payload);
        } catch (e) {
            console.error('makeAccount failed : '  + e);
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
    const fun = httpsCallable(functions, 'makeTransaction') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean }>>;

    return async (payload: MakeTransactionPayload): Promise<HttpsCallableResult<{ success: boolean }>> => {
        console.log('Called function makeTransaction');
        try {
            return await fun(payload);
        } catch (e) {
            console.error('makeTransaction failed : '  + e);
            return { data: { success: false } };
        }
    };
};

export const useGetFirestoreUser = () => {
    const functions = getFunctions();
    const fun = httpsCallable(functions, 'getFirestoreUser') as (data?: unknown) => Promise<HttpsCallableResult<{ success: boolean, account: Account | undefined }>>;

    return async (): Promise<HttpsCallableResult<{ success: boolean, account: Account | undefined }>> => {
        console.log('Called function getFirestoreUser');
        try {
            return await fun();
        } catch (e) {
            console.error('getFirestoreUser failed : '  + e);
            return { data: { success: false, account: undefined } };
        }
    };
};