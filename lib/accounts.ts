import { FirestoreDataConverter } from 'firebase/firestore';
import { ZodSchema, z } from 'zod';

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

export const SchoolSchema: ZodSchema<School> = z.number();

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

const AccountStatsSchema: ZodSchema<AccountStats> = z.object({
    totalMoneySpent: z.number(),
    servingsOrdered: z.number(),
    drinksOrdered: z.number(),
    snacksOrdered: z.number(),
});

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
    isLinkedToGoogle: boolean;
    favorites: Array<string>;
    balance: number;
    stats: AccountStats;
}

export const AccountSchema: ZodSchema<Account> = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isStaff: z.boolean(),
    isAdmin: z.boolean(),
    isAvailable: z.boolean(),
    phone: z.string(),
    email: z.string(),
    school: SchoolSchema,
    isLinkedToGoogle: z.boolean(),
    favorites: z.array(z.string()),
    balance: z.number(),
    stats: AccountStatsSchema,
});

// Note: we could also use type Account = z.infer<typeof AccountSchema> 

export type MakeAccountPayload = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    school: School;
}
  
export const MakeAccountPayloadSchema: ZodSchema<MakeAccountPayload> = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string(),
    school: SchoolSchema,
});

export type SetFavoritesPayload = {
    favorites: Array<string>;
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
            isLinkedToGoogle,
            favorites,
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
            isLinkedToGoogle,
            favorites,
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
        const { id, firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, isLinkedToGoogle, favorites, balance, stats } = account;

        if (id) {
            return { id, firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, isLinkedToGoogle, favorites, balance, stats };
        }
        return { firstName, lastName, isStaff, isAdmin, isAvailable, phone, email, school, isLinkedToGoogle, favorites, balance, stats };
    },
};
