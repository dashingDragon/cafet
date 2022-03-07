import type { DocumentReference, FirestoreDataConverter } from "firebase/firestore";
import { Account } from "./accounts";
import { Beer } from "./beers";
import { Staff } from "./staffs";

export enum TransactionType {
    Recharge = 0,
    Drink = 1,
};

type TransactionMetadata = {
    type: TransactionType,
    customer: DocumentReference<Account>,
    staff: DocumentReference<Staff>,
    createdAt: Date,
}

export type TransactionDrink = {
    id: string,
    beer: DocumentReference<Beer>,
    addons: number[],
    quantity: number,
    price: number,
} & TransactionMetadata;

export type TransactionRecharge = {
    id: string,
    amount: number,
} & TransactionMetadata;

export type Transaction = TransactionDrink | TransactionRecharge;

export const transactionConverter: FirestoreDataConverter<Transaction> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { type, customer, staff, createdAt } = data;
        if (type === TransactionType.Recharge) {
            const { amount } = data as TransactionRecharge;
            return {
                id: snapshot.id,
                amount,
                customer,
                staff,
                createdAt,
            } as TransactionRecharge;
        } else if (type === TransactionType.Drink) {
            const { beer, addons, quantity, price } = data;
            return {
                id: snapshot.id,
                beer,
                addons,
                quantity,
                price,
                customer,
                staff,
                createdAt,
            } as TransactionDrink;
        } else {
            throw Error("Unknown transaction type");
        }
    },
    toFirestore: (transaction) => {
        const { type, customer, staff, createdAt } = transaction;
        if (type === TransactionType.Recharge) {
            const { amount } = transaction as TransactionRecharge;
            return {
                amount,
                type,
                customer,
                staff,
                createdAt,
            };
        } else if (type === TransactionType.Drink) {
            const { beer, addons, quantity, price } = transaction as TransactionDrink;
            return {
                beer,
                addons,
                quantity,
                price,
                type,
                customer,
                staff,
                createdAt,
            };
        } else {
            throw Error("Unknown transaction type");
        }
    }
}
