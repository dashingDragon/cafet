import { FirestoreDataConverter } from 'firebase/firestore';

export type ingredientCategory = 'meat' | 'cheese' | 'veggie' | 'spice' | 'sauce';

export type Ingredient = {
    id: string,
    name: string,
    category: ingredientCategory,
    isVege: boolean,
    isVegan: boolean,
    price: number,
    allergen: string,
};

export const ingredientConverter: FirestoreDataConverter<Ingredient> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { name, category, isVege, isVegan, price, allergen } = data;
        return {
            id: snapshot.id,
            name,
            category,
            isVege,
            isVegan,
            price,
            allergen,
        };
    },
    toFirestore: (product) => {
        const { name, category, isVege, isVegan, price, allergen } = product;
        return { name, category, isVege, isVegan, price, allergen };
    },
};
