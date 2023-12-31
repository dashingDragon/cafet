import { FirestoreDataConverter } from 'firebase/firestore';
import { Order, TransactionState } from './transactions';
import { ZodSchema, z } from 'zod';

export type ingredientCategory = 'meat' | 'cheese' | 'veggie' | 'spice' | 'sauce';

const IngredientCategorySchema: ZodSchema<ingredientCategory> = z.enum(['meat', 'cheese', 'veggie', 'spice', 'sauce']);

export const baguetteSizes: Record<string, number> = {
    'Petit': 1/3,
    'Moyen': 1/2,
    'Grand': 2/3,
};

export type Ingredient = {
    id: string,
    name: string,
    category: ingredientCategory,
    isVege: boolean,
    isVegan: boolean,
    price: number,
    allergen: string,
    image: string,
    acronym: string,
};

export const IngredientSchema: ZodSchema<Ingredient> = z.object({
    id: z.string(),
    name: z.string(),
    category: IngredientCategorySchema,
    isVege: z.boolean(),
    isVegan: z.boolean(),
    price: z.number(),
    allergen: z.string(),
    image: z.string(),
    acronym: z.string(),
});

export const ingredientConverter: FirestoreDataConverter<Ingredient> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { name, category, isVege, isVegan, price, allergen, image, acronym } = data;
        return {
            id: snapshot.id,
            name,
            category,
            isVege,
            isVegan,
            price,
            allergen,
            image,
            acronym,
        };
    },
    toFirestore: (product) => {
        const { name, category, isVege, isVegan, price, allergen, image, acronym } = product;
        return { name, category, isVege, isVegan, price, allergen, image, acronym };
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

export const countIngredients = (orders: Order[]): Record<string, number> => {
    const ingredientsQuantities: Record<string, number> = {};
    for (const ingredient of Object.keys(ingredientsToCount)) {
        ingredientsQuantities[ingredient] = 0;
    }

    for (const order of orders.filter(o => o.transaction.state === TransactionState.Preparing)) {
        for (const productWithQty of order.transaction.productsWithQty) {
            if (productWithQty.product.ingredients === undefined) continue;
            for (const ingredient of productWithQty.product.ingredients) {
                if (ingredient.name === 'Baguette') {
                    Object.entries(productWithQty.sizeWithQuantities).forEach(([size, quantity]) => {
                        if (baguetteSizes[size]) {
                            ingredientsQuantities[ingredient.name] += baguetteSizes[size] * quantity;
                        }
                    });
                } else if (Object.keys(ingredientsToCount).includes(ingredient.name)) {
                    Object.entries(productWithQty.sizeWithQuantities).forEach(([size, quantity]) => {
                        ingredientsQuantities[ingredient.name] += quantity;
                    });
                }
            }
        }
    }

    // Round the baguette count and add some more just in case
    ingredientsQuantities['Baguette'] = ingredientsQuantities['Baguette'] ?  Math.ceil(ingredientsQuantities['Baguette']) + 3 : 0;

    return ingredientsQuantities;
};

export const ingredientsToCount: Record<string, string> = {
    'Poulet': '/png/chicken.png',
    'Jambon': '/png/ham.png',
    'Thon': '/png/tuna.png',
    'Chèvre': '/png/goat.png',
    'Emmental': '/png/cheese.png',
    'Mozzarella': '/png/mozzarella.png',
    'Maïs': '/png/corn.png',
    'Salade': '/png/lettuce.png',
    'Concombre': '/png/cucumber.png',
    'Tomate': '/png/tomato.png',
    'Oignons frits': '/png/onion.png',
    'Baguette': 'png/bread.png',
};

export const getIngredientPrice = (ingredients: Ingredient[] | undefined): number => {
    if (!ingredients) {
        return 0;
    }

    let price = 0;
    for (const ingredient of ingredients) {
        price += ingredient.price;
    }
    return price;
};

export const ingredientCategoryOrder = [
    'veggie',
    'sauce',
    'spice',
    'meat',
    'cheese',
];
