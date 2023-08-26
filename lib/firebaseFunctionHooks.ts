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
 * Get the list of non-staff users.
 *
 * @returns a google cloud function to get the list of non-staff users.
 */
export const useListCustomers = () => {
    const functions = getFunctions();
    const fun = httpsCallable(functions, 'listNonStaffUsers');

    return async () => {
        console.log('Called function listNonStaffUsers');
        return (await fun({})).data as Account[];
    };
};

export const useCustomers: () => [Account[], () => Promise<void>] = () => {
    const customerList = useListCustomers();
    const [pending, setPending] = useState<Account[]>([]);

    const refresh = async () => {
        setPending((await customerList()));
    };

    return [pending, refresh];
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
