
export enum School {
    Ensimag = 0,
    Phelma,
    E3,
    Papet,
    Gi,
    Polytech,
    Esisar,
    Iae,
    Uga,
    Unknown,
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
