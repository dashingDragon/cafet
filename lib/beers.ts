import { FirestoreDataConverter, DocumentReference, doc, getFirestore } from "firebase/firestore";

export type Beer = {
    id: string,
    name: string,
    isAvailable: boolean,
    image: string | undefined,
    typeId: string,
};

export type BeerTypeAddon = {
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

export const beerConverter: FirestoreDataConverter<Beer> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { name, isAvailable, image, type } = data;
        return {
            id: snapshot.id,
            name,
            isAvailable,
            image,
            typeId: type.id,
        };
    },
    toFirestore: (beer) => {
        const { name, isAvailable, image, typeId } = beer;
        return { name, isAvailable, image, type: doc(getFirestore(), `beerTypes/${typeId}`) };
    }
};

export const beerTypeConverter: FirestoreDataConverter<BeerType> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { name, price, addons } = data;
        return {
            id: snapshot.id,
            name,
            price,
            addons,
        };
    },
    toFirestore: (beerType) => {
        const { name, price, addons } = beerType;
        return { name, price, addons };
    },
};
