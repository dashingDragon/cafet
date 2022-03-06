
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
