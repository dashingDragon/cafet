import { FirestoreDataConverter } from 'firebase/firestore';

export const MAX_MONEY_PER_ACCOUNT = 100 * 100; // max 100€ at a time on one account

export enum School {
    Ensimag = 0,
    Phelma = 1,
    E3 = 2,
    Papet = 3,
    Gi = 4,
    Polytech = 5,
    Esisar = 6,
    Iae = 7,
    Uga = 8,
    Unknown = 9,
}

export type Account = {
    id: string | undefined;
    firstName: string;
    lastName: string;
    school: School;
    balance: number;
    stats: {
        totalMoneySpent: number;
        servingsOrdered: number;
        drinksOrdered: number;
        snacksOrdered: number;
    }
};

export const accountConverter: FirestoreDataConverter<Account> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { firstName, lastName, school, balance, stats: {totalMoneySpent, servingsOrdered, drinksOrdered, snacksOrdered} } = data;
        return {
            id: snapshot.id,
            firstName,
            lastName,
            school,
            balance,
            stats: {
                totalMoneySpent,
                servingsOrdered,
                drinksOrdered,
                snacksOrdered,
            },
        };
    },
    toFirestore: (account) => {
        const { firstName, lastName, school, balance, stats } = account;
        return { firstName, lastName, school, balance, stats };
    },
};
