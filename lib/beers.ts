export type Beer = {
    id: string,
    name: string,
    isAvailable: boolean,
    image: string | undefined,
    typeId: string,
};

export type BeerTypeAddon = {
    id: string,
    name: string,
    price: number,
};

export type BeerType = {
    id: string,
    name: string,
    price: number,
    addons: BeerTypeAddon[],
};

export type BeerWithType = {
    beer: Beer,
    type: BeerType,
};
