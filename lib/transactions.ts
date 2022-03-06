import type { DocumentReference } from "firebase/firestore";
import { Account } from "./accounts";
import { Beer } from "./beers";
import { Staff } from "./staffs";

type TransactionMetadata = {
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
} | TransactionMetadata;

export type TransactionRecharge = {
    id: string,
    amount: number,
} | TransactionMetadata;
