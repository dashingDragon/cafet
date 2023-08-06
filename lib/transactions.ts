import type { DocumentReference, FirestoreDataConverter } from "firebase/firestore";
import { Account } from "./accounts";
import { Product, ProductRefWithQty, ProductWithQty } from "./product";
import { Staff } from "./staffs";

export enum TransactionType {
    Recharge = 0,
    Order = 1,
};

type TransactionMetadata = {
    type: TransactionType,
    customer: DocumentReference<Account>,
    staff: DocumentReference<Staff>,
    createdAt: Date,
}

export type TransactionRecharge = {
    id: string,
    amount: number,
} & TransactionMetadata;

export type TransactionOrder = {
    id: string;
    productsWithQty: ProductRefWithQty[],
    price: number,
} & TransactionMetadata;

export type Transaction = TransactionRecharge | TransactionOrder;

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
    } else if (type === TransactionType.Order) {
      const {
        productsWithQty,
        price,
      } = data;
      return {
        id: snapshot.id,
        productsWithQty,
        price,
        customer,
        staff,
        createdAt,
      } as TransactionOrder;
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
    } else if (type === TransactionType.Order) {
      const {
        productsWithQty,
        price,
      } = transaction as TransactionOrder;
      return {
        productsWithQty,
        price,
        type,
        customer,
        staff,
        createdAt,
      };
    } else {
      throw Error("Unknown transaction type");
    }
  },
};
