import { FirestoreDataConverter, doc, getFirestore } from 'firebase/firestore';
import { Ingredient, IngredientSchema } from './ingredients';
import { ZodSchema, z } from 'zod';

export type productType = 'serving' | 'drink' | 'snack';

const ProductTypeSchema: ZodSchema<productType> = z.enum(['serving', 'drink', 'snack']);

export type Product = {
    id: string;
    type: productType;
    name: string;
    isAvailable: boolean;
    sizeWithPrices: Record<string, number>;
    image?: string;
    isVege?: boolean;
    isVegan?: boolean;
    allergen?: string;
    ingredients?: Ingredient[];
    description?: string;
    stock?: number;
};

const ProductSchema: ZodSchema<Product> = z.object({
    id: z.string(),
    type: ProductTypeSchema,
    name: z.string(),
    isAvailable: z.boolean(),
    sizeWithPrices: z.record(z.number()),
    image: z.string(),
    isVege: z.optional(z.boolean()),
    isVegan: z.optional(z.boolean()),
    allergen: z.optional(z.string()),
    ingredients: z.optional(z.array(IngredientSchema)),
    description: z.optional(z.string()),
    stock: z.optional(z.number()),
});

export type ProductWithQty = {
    id: string;
    product: Product;
    sizeWithQuantities: Record<string, number>;
}

export const ProductWithQtySchema: ZodSchema<ProductWithQty> = z.object({
    id: z.string(),
    product: ProductSchema,
    sizeWithQuantities: z.record(z.number()),
});

export const productConverter: FirestoreDataConverter<Product> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { type, name, isAvailable, image, sizeWithPrices, isVege, isVegan, allergen, ingredients, description, stock } = data;
        return {
            id: snapshot.id,
            type,
            name,
            isAvailable,
            sizeWithPrices,
            ...(image !== undefined && {image}),
            ...(isVege !== undefined && {isVege}),
            ...(isVegan !== undefined && {isVegan}),
            ...(allergen !== undefined && {allergen}),
            ...(ingredients !== undefined && {ingredients}),
            ...(description !== undefined && {description}),
            ...(stock !== undefined && {stock}),
        };
    },
    toFirestore: (product) => {
        const { type, name, isAvailable, image, sizeWithPrices, isVege, isVegan, allergen, ingredients, description, stock } = product;
        return {
            type,
            name,
            isAvailable,
            sizeWithPrices,
            ...(image !== undefined && {image}),
            ...(isVege !== undefined && {isVege}),
            ...(isVegan !== undefined && {isVegan}),
            ...(allergen !== undefined && {allergen}),
            ...(ingredients !== undefined && {ingredients}),
            ...(description !== undefined && {description}),
            ...(stock !== undefined && {stock}),
        };
    },
};

export const productWithQtyConverter: FirestoreDataConverter<ProductWithQty> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { product, sizeWithQuantities } = data;
        return {
            id: snapshot.id,
            product,
            sizeWithQuantities,
        };
    },
    toFirestore: (productWithQty) => {
        const { product, sizeWithQuantities } = productWithQty;
        return { product: doc(getFirestore(), `products/${(product as Product).id}`), sizeWithQuantities };
    },
};
export const productCarouselItems = [
    {
        id: 'serving',
        label: 'Plats',
        icon: '/png/serving.png',
    },
    {
        id: 'drink',
        label: 'Boissons',
        icon: '/png/drink.png',
    },
    {
        id: 'snack',
        label: 'Snacks',
        icon: '/png/snack.png',
    },
] as CarouselItem[];

export const sandwichSizeWithPrices: Record<string, number> = {
    'Petit': 150,
    'Moyen': 200,
    'Grand': 250,
};

export type CarouselItem = {
    id: string;
    label: string;
    icon: string;
};
