import { FirestoreDataConverter } from 'firebase/firestore';

export type Stat = {
    id: string,
    totalMoneySpent: number;
    servingsOrdered: number;
    drinksOrdered: number;
    snacksOrdered: number;
}

export const statConverter: FirestoreDataConverter<Stat> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { totalMoneySpent, servingsOrdered, drinksOrdered, snacksOrdered } = data;
        return {
            id: snapshot.id,
            totalMoneySpent: totalMoneySpent,
            servingsOrdered: servingsOrdered,
            drinksOrdered: drinksOrdered,
            snacksOrdered: snacksOrdered,
        };
    },
    toFirestore: (stat) => {
        const { totalMoneySpent, servingsOrdered, drinksOrdered, snacksOrdered } = stat;
        return { totalMoneySpent, servingsOrdered, drinksOrdered, snacksOrdered };
    },
};
