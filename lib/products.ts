import { FirestoreDataConverter, doc, getFirestore } from 'firebase/firestore';
import { Ingredient } from './ingredients';

export type productType = 'serving' | 'drink' | 'snack';

export type Product = {
    id: string;
    type: productType;
    name: string;
    isAvailable: boolean;
    image: string;
    sizeWithPrices: Record<string, number>;
    isVege?: boolean;
    isVegan?: boolean;
    allergen?: string;
    ingredients?: Ingredient[];
    description?: string;
    stock?: number;
};

export type ProductWithQty = {
    id: string;
    product: Product;
    quantity: number;
    size: string;
}

export const productConverter: FirestoreDataConverter<Product> = {
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        const { type, name, isAvailable, image, sizeWithPrices, isVege, isVegan, allergen, ingredients, description, stock } = data;
        return {
            id: snapshot.id,
            type,
            name,
            isAvailable,
            image,
            sizeWithPrices,
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
            image,
            sizeWithPrices,
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
        const { product, quantity, size } = data;
        return {
            id: snapshot.id,
            product,
            quantity,
            size,
        };
    },
    toFirestore: (productWithQty) => {
        const { product, quantity, size } = productWithQty;
        return { product: doc(getFirestore(), `products/${(product as Product).id}`), quantity, size };
    },
};