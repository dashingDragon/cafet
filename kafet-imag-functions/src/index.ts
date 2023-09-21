/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import type { } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {FirestoreDataConverter} from '@google-cloud/firestore';
import {MakeTransactionPayload, Transaction, TransactionState, TransactionType, transactionConverter} from '../../lib/transactions';
import {Account, AccountSchema, MakeAccountPayload, SchoolSchema, SetFavoritesPayload, accountConverter} from '../../lib/accounts';
import {Product, ProductWithQtySchema, productConverter, sandwichSizeWithPrices} from '../../lib/products';
import {Stat, statConverter} from '../../lib/stats';
import {Ingredient, getIngredientPrice, ingredientConverter} from '../../lib/ingredients';
import {DateTime} from 'luxon';
import {z} from 'zod';

const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ -]{1,30}$/;

admin.initializeApp();

const checkIfConnected = async (uid: string | undefined) => {
    if (!uid) {
        throw new functions.https.HttpsError('unauthenticated', 'You need to be connected.');
    }
};

const checkIfUser = async (uid: string | undefined): Promise<Account> => {
    await checkIfConnected(uid);
    const firestoreUser = (await admin.firestore().doc(`accounts/${uid}`)
        .withConverter(accountConverter as unknown as FirestoreDataConverter<Account>)
        .get()
    ).data();
    if (!firestoreUser) {
        throw new functions.https.HttpsError('invalid-argument', 'User not found.');
    }
    return firestoreUser;
};

/**
 * Create new account linked to the user's google uid.
 */
export const makeAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to make an account.');
    }

    const {firstName, lastName, phone, school, email} = data as MakeAccountPayload;
    console.log(data);
    if (!nameRegex.test(firstName)) {
        throw new functions.https.HttpsError('invalid-argument', 'First name must contains only letters or dashes.');
    }
    if (!nameRegex.test(firstName)) {
        throw new functions.https.HttpsError('invalid-argument', 'Last name must contains only letters or dashes.');
    }
    const phoneRegex = /^[\d\s+]{1,15}$/;
    if (phone !== '' && !phoneRegex.test(phone)) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone number format can only contain spaces, numbers (prefixed with a +).');
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (email !== '' && !emailRegex.test(email)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email format.');
    }
    if (!SchoolSchema.safeParse(school)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid school number.');
    }
    const googleUid = context.auth.uid;

    const firestoreUser = (await admin.firestore().doc(`accounts/${googleUid}`)
        .withConverter(accountConverter as unknown as FirestoreDataConverter<Account>)
        .get()
    ).data();

    if (firestoreUser) {
        throw new functions.https.HttpsError('permission-denied', 'User with same uid already exists');
    }

    const userDocument: Account = {
        id: '',
        firstName,
        lastName,
        email: email ? email: context.auth.token.email ?? '',
        phone: phone ? phone : context.auth.token.phone_number ?? '',
        school,
        isStaff: false,
        isAdmin: false,
        isAvailable: false,
        isLinkedToGoogle: true,
        favorites: [],
        balance: 0,
        stats: {
            totalMoneySpent: 0,
            servingsOrdered: 0,
            drinksOrdered: 0,
            snacksOrdered: 0,
        },
    };

    try {
        await admin.firestore().collection('accounts').doc(googleUid).set(userDocument);
        return {success: true};
    } catch {
        return {success: false};
    }
});

/**
 * Retrieve the firestore user associated to the user's google account.
 */
export const getFirestoreUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated have a firestore account.');
    }

    try {
        const db = admin.firestore();
        const googleUid = context.auth.uid;
        const accountRef = db.doc(`accounts/${googleUid}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
        const accountData = (await accountRef.get()).data();
        return {success: true, account: accountData};
    } catch {
        return {success: false, account: undefined};
    }
});

/**
 * Retrieve the user's order history.
 */
export const getOrderHistory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated have an order history.');
    }

    try {
        const db = admin.firestore();
        const googleUid = context.auth.uid;

        const transactions = (await db.collection('transactions').withConverter(transactionConverter as unknown as FirestoreDataConverter<Transaction>)
            .where('customer.id', '==', googleUid)
            .where('type', '==', TransactionType.Order)
            .get()
        ).docs.map((doc) => doc.data());

        console.log('transactions after modification');
        console.log(transactions);

        return {success: true, orders: transactions};
    } catch (error) {
        console.error(error);
        return {success: false, orders: undefined};
    }
});

/**
 * Update the list of favorite foods of the customer.
 */
export const setFavorites = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to have favorite servings.');
    }
    const db = admin.firestore();
    const googleUid = context.auth.uid;

    const {favorites} = (data as SetFavoritesPayload);
    favorites.forEach((favorite) => {
        if (!nameRegex.test(favorite)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid format for favorite id.');
        }
    });

    try {
        const accountRef = db.doc(`accounts/${googleUid}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
        await accountRef.update({
            favorites: favorites,
        });

        return {success: true};
    } catch (error) {
        console.error(error);
        return {success: false};
    }
});

const getIngredientPriceFromDb = async (ingredients?: Ingredient[]): Promise<number> => {
    const db = admin.firestore();

    if (!ingredients) {
        return 0;
    }

    let price = 0;
    for (const ingredient of ingredients) {
        const ingredientSnapshot = await db.doc(`ingredients/${ingredient.id}`)
            .withConverter(ingredientConverter as unknown as FirestoreDataConverter<Ingredient>)
            .get();
        const ingredientData = ingredientSnapshot.data();
        if (ingredientData && ingredientData.price) {
            price += ingredientData.price;
        }
    }

    return price;
};

/**
 * Make a pay transaction.
 * Check if the stock is available and if the user has provision for the payment.
 * Also check if it is still time for an order.
 */
export const makeTransaction = functions.https.onCall(async (data, context) => {
    const {account, productsWithQty, needPreparation} = (data as MakeTransactionPayload);
    if (!AccountSchema.safeParse(account)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid account format.');
    }
    if (!z.array(ProductWithQtySchema).safeParse(productsWithQty)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid productsWithQty format.');
    }
    if (!z.boolean().parse(needPreparation)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid needPreparation format.');
    }
    const db = admin.firestore();

    const requestingAccount = await checkIfUser(context.auth?.uid);
    let customerRef;

    if (requestingAccount.isAdmin) {
        // update given account if request comes from admin
        customerRef = db.doc(`accounts/${account.id}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
    } else {
        // update requesting user account if not an admin
        customerRef = db.doc(`accounts/${context.auth?.uid}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
    }

    const customerAccount = (await customerRef.get()).data();
    if (!customerAccount) {
        throw new functions.https.HttpsError('invalid-argument', 'Account not found');
    }

    // Compute price, check user provision and check availability of products.
    let priceProducts = 0;
    const quantityOrdered = {
        'serving': 0,
        'drink': 0,
        'snack': 0,
    };
    for (let i = 0; i < productsWithQty.length; i++) {
        const productWithQtySize = productsWithQty[i];

        // Do not trust user product price, check with db
        const productSnapshot = await db.doc(`products/${productWithQtySize.product.id}`)
            .withConverter(productConverter as unknown as FirestoreDataConverter<Product>)
            .get();
        if (!productSnapshot.exists) {
            // Custom sandwich case
            for (const [size, quantity] of Object.entries(productWithQtySize.sizeWithQuantities)) {
                // Check user input.
                if (quantity < 0) {
                    throw new functions.https.HttpsError('invalid-argument', 'Quantities must be positive.');
                } else if (quantity > 0) {
                    if (!Object.keys(sandwichSizeWithPrices).includes(size)) {
                        throw new functions.https.HttpsError('invalid-argument', 'Size must exist for given product.');
                    }
                    const ingredientPrice = await getIngredientPriceFromDb(productWithQtySize.product.ingredients);
                    if (ingredientPrice < 0) {
                        throw new functions.https.HttpsError('invalid-argument', 'Unknown ingredient, cannot compute product price.');
                    }
                    console.log('ingredientPrice:' + ingredientPrice);
                    priceProducts += (sandwichSizeWithPrices[size] + ingredientPrice) * quantity;
                    console.log('priceProducts:' + priceProducts);
                    // Enter serving by hand to avoid cheating
                    quantityOrdered['serving'] += quantity;
                }
            }
        } else {
            const productData = productSnapshot.data();
            if (!productData) {
                throw new functions.https.HttpsError('not-found', 'Product not found.');
            }
            if (!productData.isAvailable) {
                throw new functions.https.HttpsError('unavailable', 'Product is unavailable');
            }

            Object.entries(productWithQtySize.sizeWithQuantities).forEach(([size, quantity]) => {
                // Check user input.
                if (quantity < 0) {
                    throw new functions.https.HttpsError('invalid-argument', 'Quantities must be positive.');
                } else if (quantity > 0) {
                    if (!Object.keys(productData.sizeWithPrices).includes(size)) {
                        throw new functions.https.HttpsError('invalid-argument', 'Size must exist for given product.');
                    }
                    if (productData.stock && productData.stock < quantity) {
                        throw new functions.https.HttpsError('resource-exhausted', 'Queried quantity exceeds remaining product stock.');
                    }
                    priceProducts += (productData.sizeWithPrices[size] + getIngredientPrice(productData.ingredients)) * quantity;
                    quantityOrdered[productData.type] += quantity;
                }
            });
        }
    }

    if (priceProducts > customerAccount.balance) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have enough provision on your account.');
    }

    if (quantityOrdered['serving'] > 2) {
        throw new functions.https.HttpsError('permission-denied', 'You cannot order more than two servings.');
    }

    const parisTimeZone = 'Europe/Paris';
    const currentTimeParis = DateTime.now().setZone(parisTimeZone);

    if (!requestingAccount.isAdmin && (currentTimeParis.weekday === 6 /* saturday */ || currentTimeParis.weekday === 7 /* sunday */)) {
        throw new functions.https.HttpsError('permission-denied', 'You can only order on weekdays (Monday to Friday).');
    }

    const startOfDayParis = currentTimeParis.set({hour: 0, minute: 0, second: 0, millisecond: 1});
    const endOfDayParis = currentTimeParis.set({hour: 11, minute: 30, second: 0, millisecond: 0});

    if (!requestingAccount.isAdmin && !startOfDayParis.until(endOfDayParis).contains(currentTimeParis)) {
        throw new functions.https.HttpsError('permission-denied', 'You can only order between 0:00 AM and 11:30 AM Paris time.');
    }

    // Write the transaction.
    const transactionRef = db.collection('transactions').doc();

    const batch = db.batch();
    batch.create(transactionRef, {
        id: '0',
        type: TransactionType.Order,
        productsWithQty: productsWithQty,
        price: priceProducts,
        state: !needPreparation && requestingAccount.isAdmin ? TransactionState.Served : TransactionState.Preparing,
        customer: account,
        admin: requestingAccount.isAdmin ? requestingAccount : {},
        createdAt: new Date(),
    });

    // Update the products stocks.
    for (let i = 0; i < productsWithQty.length; i++) {
        const productRef = db.doc(`products/${productsWithQty[i].product.id}`).withConverter(productConverter as unknown as FirestoreDataConverter<Product>);
        const productSnapshot = await productRef.get();
        if (productSnapshot.exists) {
            const productData = productSnapshot.data();
            // Actually useless as .exists=true garantees that productData is defined
            if (!productData) {
                throw new functions.https.HttpsError('not-found', 'Product not found.');
            }
            if (productData.stock) {
                batch.update(productRef, {
                    stock: productData.stock - Object.values(productsWithQty[i].sizeWithQuantities).reduce((a, b) => a + b),
                });
            }
        }
    }

    if (!needPreparation) {
        // Update the global stats
        const statsRef = db.doc('stats/0').withConverter(statConverter as unknown as FirestoreDataConverter<Stat>);
        const statsData = (await statsRef.get()).data();

        if (!statsData) {
            throw new functions.https.HttpsError('internal', 'Could not access global stats.');
        }

        batch.update(statsRef, {
            totalMoneySpent: statsData.totalMoneySpent += priceProducts,
            servingsOrdered: statsData.servingsOrdered += quantityOrdered['serving'],
            drinksOrdered: statsData.drinksOrdered += quantityOrdered['drink'],
            snacksOrdered: statsData.snacksOrdered += quantityOrdered['snack'],
        });

        // Update balance.
        batch.update(customerRef, {
            balance: account.balance - priceProducts,
            stats: {
                totalMoneySpent: account.stats.totalMoneySpent += priceProducts,
                servingsOrdered: account.stats.servingsOrdered += quantityOrdered['serving'],
                drinksOrdered: account.stats.drinksOrdered += quantityOrdered['drink'],
                snacksOrdered: account.stats.snacksOrdered += quantityOrdered['snack'],
            },
        });
    }

    try {
        // Exécutez le batch
        await batch.commit();
        return {success: true};
    } catch (error) {
        console.error('An error occured during batching :', error);
        throw new functions.https.HttpsError('internal', 'An error occured during batching: ' + error);
    }
});
