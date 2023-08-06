import { DocumentReference, FirestoreDataConverter, doc, getFirestore } from "firebase/firestore";

export type productType = "serving" | "drink" | "snack";

export type Product = {
    id: string,
    type: productType,
    name: string,
    isAvailable: boolean,
    image: string | undefined,
    price: number,
    description?: string;
    stock?: number,
};

export type ProductWithQty = {
    id: string;
    product: Product;
    quantity: number;
}

export type ProductRefWithQty = {
  id: string;
  productRef: DocumentReference<Product>;
  quantity: number;
}

export const productConverter: FirestoreDataConverter<Product> = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const { type, name, isAvailable, image, price, description, stock } = data;
    return {
      id: snapshot.id,
      type,
      name,
      isAvailable,
      image,
      price,
      ...(description !== undefined && {description}),
      ...(stock !== undefined && {stock}),
    };
  },
  toFirestore: (product) => {
    const { type, name, isAvailable, image, price, description, stock } = product;
    return { type, name, isAvailable, image, price, ...(description && {description}), ...(stock !== undefined && {stock}) };
  },
};

export const productWithQtyConverter: FirestoreDataConverter<ProductWithQty> = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const { product, quantity } = data;
    return {
      id: snapshot.id,
      product,
      quantity,
    };
  },
  toFirestore: (productWithQty) => {
    const { product, quantity } = productWithQty;
    return { product: doc(getFirestore(), `products/${(product as Product).id}`), quantity };
  },
};