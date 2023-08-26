import { FirestoreDataConverter } from 'firebase/firestore';

export const MAX_MONEY_PER_ACCOUNT = 50 * 100; // max 50€ at a time on one account

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

export const allSchools = [
    { value: School.Ensimag, name: School[School.Ensimag] },
    { value: School.Phelma, name: School[School.Phelma] },
    { value: School.E3, name: School[School.E3] },
    { value: School.Papet, name: School[School.Papet] },
    { value: School.Gi, name: School[School.Gi] },
    { value: School.Polytech, name: School[School.Polytech] },
    { value: School.Esisar, name: School[School.Esisar] },
    { value: School.Iae, name: School[School.Iae] },
    { value: School.Uga, name: School[School.Uga] },
    { value: School.Unknown, name: School[School.Unknown] },
];

export type AccountStats = {
    totalMoneySpent: number;
    servingsOrdered: number;
    drinksOrdered: number;
    snacksOrdered: number;
}

export type Account = {
    id: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    isAdmin: boolean;
    isAvailable: boolean;
    phone: string;
    email: string;
    school: School;
    balance: number;
    stats: AccountStats;
}

export type MakeAccountPayload = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    school: School;
}

export const accountConverter: FirestoreDataConverter<Account> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const {
            firstName,
            lastName,
            isStaff,
            isAdmin,
            isAvailable,
            phone,
            email,
            school,
            balance,
            stats: {
                totalMoneySpent,
                servingsOrdered,
                drinksOrdered,
                snacksOrdered,
            },
        } = data;
        return {
            id: snapshot.id,
            firstName,
            lastName,
            isStaff,
            isAdmin,
            isAvailable,
            phone,
            email,
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
        const { id, firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, balance, stats } = account;

        if (id) {
            return { id, firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, balance, stats };
        }
        return { firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, balance, stats };
    },
};
