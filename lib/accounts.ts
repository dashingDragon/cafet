import { FirestoreDataConverter } from "firebase/firestore";

export const MEMBERSHIP_PRICE = 10 * 100;

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
    isMember: boolean;
    school: School;
    balance: number;
    stats: {
        quantityDrank: number;
        totalMoney: number;
    };
};

export const accountConverter: FirestoreDataConverter<Account> = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const { firstName, lastName, isMember, school, balance, stats: { quantityDrank, totalMoney } } = data;
    return {
      id: snapshot.id,
      firstName,
      lastName,
      isMember,
      school,
      balance,
      stats: {
        quantityDrank,
        totalMoney,
      },
    };
  },
  toFirestore: (account) => {
    const { firstName, lastName, isMember, school, balance, stats } = account;
    return { firstName, lastName, isMember, school, balance, stats };
  },
};
