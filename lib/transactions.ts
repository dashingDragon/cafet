import type { FirestoreDataConverter } from 'firebase/firestore';
import { Account } from './accounts';
import { ProductWithQty } from './products';
import { Timestamp } from 'firebase/firestore';

export enum TransactionType {
    Recharge = 0,
    Order = 1,
}

export enum TransactionState {
    Preparing = 0,
    Ready = 1,
    Served = 2,
}

type TransactionMetadata = {
    type: TransactionType;
    customer: Account;
    admin: Account | undefined;
    createdAt: Timestamp;
}

export type TransactionRecharge = {
    id: string;
    amount: number;
} & TransactionMetadata;

export type TransactionOrder = {
    id: string;
    productsWithQty: ProductWithQty[];
    price: number;
    state: TransactionState;
} & TransactionMetadata & Exclude<keyof any, 'id'>;

export type Transaction = TransactionRecharge | TransactionOrder;

export type MakeTransactionPayload = {
    account: Account,
    productsWithQty: ProductWithQty[],
    needPreparation: boolean,
}

export type Order = {
    id: number,
    transaction: TransactionOrder,
}

export const transactionConverter: FirestoreDataConverter<Transaction> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { type, customer, admin, createdAt } = data;
        if (type === TransactionType.Recharge) {
            const { amount } = data as TransactionRecharge;
            return {
                id: snapshot.id,
                amount,
                type,
                customer,
                admin,
                createdAt,
            } as TransactionRecharge;
        } else if (type === TransactionType.Order) {
            const {
                productsWithQty,
                price,
                state,
            } = data as TransactionOrder;
            return {
                id: snapshot.id,
                productsWithQty,
                price,
                state,
                type,
                customer,
                admin,
                createdAt,
            } as TransactionOrder;
        } else {
            throw Error('Unknown transaction type');
        }
    },
    toFirestore: (transaction) => {
        const { type, customer, admin, createdAt } = transaction;
        if (type === TransactionType.Recharge) {
            const { amount } = transaction as TransactionRecharge;
            return {
                amount,
                type,
                customer,
                admin,
                createdAt,
            };
        } else if (type === TransactionType.Order) {
            const {
                productsWithQty,
                price,
                state,
            } = transaction as TransactionOrder;
            return {
                productsWithQty,
                price,
                state,
                type,
                customer,
                admin,
                createdAt,
            };
        } else {
            throw Error('Unknown transaction type');
        }
    },
};
