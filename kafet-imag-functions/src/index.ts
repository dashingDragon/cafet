/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import type { } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {FirestoreDataConverter} from '@google-cloud/firestore';
import {MakeTransactionPayload, TransactionState, TransactionType} from '../../lib/transactions';
import {Account, MakeAccountPayload, accountConverter} from '../../lib/accounts';
import {Product, productConverter} from '../../lib/products';
import {Stat, statConverter} from '../../lib/stats';
import {getIngredientPrice} from '../../lib/ingredients';
import {DateTime} from 'luxon';

admin.initializeApp();

const checkIfConnected = async (uid: string | undefined) => {
    if (!uid) {
        throw new functions.https.HttpsError('unauthenticated', 'You need to be connected.');
    }
};

const checkIfUser = async (uid: string | undefined) => {
    await checkIfConnected(uid);
    const firestoreUser = (await admin.firestore().doc(`accounts/${uid}`)
        .withConverter(accountConverter as unknown as FirestoreDataConverter<Account>)
        .get()
    ).data();
    if (!firestoreUser) {
        throw new functions.https.HttpsError('not-found', 'User not found.');
    }
    return firestoreUser;
};

const checkIfStaff = async (uid: string | undefined) => {
    const firestoreStaffUser = await checkIfUser(uid);
    if (!firestoreStaffUser.isStaff) {
        throw new functions.https.HttpsError('permission-denied', 'You are not a staff.');
    }
    return firestoreStaffUser;
};

const checkIfAdmin = async (uid: string | undefined) => {
    const firestoreStaffUser = await checkIfStaff(uid);
    if (!firestoreStaffUser.isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'You are not an admin.');
    }
};

/**
 * Create new account linked to the user's google uid.
 */
export const makeAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to make an account.');
    }

    const {firstName, lastName, phone, school, email} = data as MakeAccountPayload;
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
 * List non staff google users, aka customers. Used to pick new staffs.
 */
export const listCustomers = functions.https.onCall(async (data, context) => {
    await checkIfAdmin(context.auth?.uid);
    // There is always less than 1000 users
    const googleUsersIds = (await admin.auth().listUsers()).users.map((u) => u.uid);
    const customers = (await admin.firestore()
        .collection('accounts')
        .where('isStaff', '==', false)
        .withConverter(accountConverter as unknown as FirestoreDataConverter<Account>)
        .get()
    ).docs.map((s) => s.data());

    const customerGoogleUsers = customers.filter((u) => googleUsersIds.includes(u.id));

    return customerGoogleUsers;
});

/**
 * Make a pay transaction.
 * Check if the stock is available and if the user has provision for the payment.
 * Also check if it is still time for an order.
 */
export const makeTransaction = functions.https.onCall(async (data, context) => {
    const user = await checkIfUser(context.auth?.uid);
    const db = admin.firestore();
    const {account, productsWithQty, needPreparation} = (data as MakeTransactionPayload);
    const accountRef = db.doc(`accounts/${account.id}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
    const accountData = (await accountRef.get()).data();
    if (!accountData) {
        throw new functions.https.HttpsError('not-found', 'Account not found');
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
            }
            if (!Object.keys(productData.sizeWithPrices).includes(size)) {
                throw new functions.https.HttpsError('invalid-argument', 'Size must exist for given product.');
            }
            if (productData.stock && productData.stock < quantity) {
                throw new functions.https.HttpsError('resource-exhausted', 'Queried quantity exceeds remaining product stock.');
            }
            priceProducts += (productData.sizeWithPrices[size] + getIngredientPrice(productData.ingredients)) * quantity;
            quantityOrdered[productWithQtySize.product.type] += quantity;
        });
    }

    if (priceProducts > accountData.balance) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have enough provision on your account.');
    }

    if (quantityOrdered['serving'] > 2) {
        throw new functions.https.HttpsError('permission-denied', 'You cannot order more than two servings.');
    }

    const parisTimeZone = 'Europe/Paris';
    const currentTimeParis = DateTime.now().setZone(parisTimeZone);
    const startOfDayParis = currentTimeParis.set({hour: 0, minute: 0, second: 0, millisecond: 1});
    const endOfDayParis = currentTimeParis.set({hour: 11, minute: 30, second: 0, millisecond: 0});

    if (!startOfDayParis.until(endOfDayParis).contains(currentTimeParis)) {
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
        state: needPreparation ? TransactionState.Preparing : TransactionState.Served,
        customer: account,
        admin: user.isAdmin ? user : undefined,
        createdAt: new Date(),
    });

    // Update the products stocks.
    for (let i = 0; i < productsWithQty.length; i++) {
        const productRef = db.doc(`products/${productsWithQty[i].product.id}`).withConverter(productConverter as unknown as FirestoreDataConverter<Product>);
        const productSnapshot = await productRef.get();
        const productData = productSnapshot.data();
        if (!productData) {
            throw new functions.https.HttpsError('not-found', 'Product not found.');
        }
        if (productData.stock) {
            batch.update(productRef, {
                stock: productData.stock - Object.values(productsWithQty[i].sizeWithQuantities).reduce((a, b) => a + b),
            });
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
        batch.update(accountRef, {
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
