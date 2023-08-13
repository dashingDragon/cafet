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

export const parseIngredients = (ingredients: Ingredient[]): {
    isVege: boolean;
    isVegan: boolean;
    allergen: string;
    description: string;
} => {
    let isVege = true;
    let isVegan = true;
    let allergen: string[] = [];
    let description: string[] = [];


    for (const ingredient of ingredients) {
        description.push(ingredient.name);
        if (ingredient.allergen) {
            allergen.push(ingredient.allergen);
        }
        if (!ingredient.isVegan) {
            isVegan = false;
        }
        if (!ingredient.isVege) {
            isVege = false;
        }
    }

    return {
        isVege,
        isVegan,
        allergen: allergen.filter((value, index, self) => self.indexOf(value) === index).join(', '),
        description: description.join(', '),
    };
};

export const getIngredientPrice = (ingredients?: Ingredient[]): number => {
    if (!ingredients) {
        return 0;
    }

    let price = 0;
    for (const ingredient of ingredients) {
        price += ingredient.price;
    }
    return price;
};