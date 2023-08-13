/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import type { } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {MakeStaffPayload, Staff, staffConverter as externalStaffConverter} from '../../lib/staffs';
import {ListPendingStaffs} from '../../lib/firebaseFunctionHooks';
import {FirestoreDataConverter} from '@google-cloud/firestore';
import {MakeTransactionPayload, TransactionType} from '../../lib/transactions';
import {Account, accountConverter} from '../../lib/accounts';
import {Product, productConverter} from '../../lib/products';

const staffConverter = externalStaffConverter as unknown as FirestoreDataConverter<Staff>;

admin.initializeApp();

const computeTotalPrice = (price: number, quantity: number ) => {
    if (quantity <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Quantities must be positive.');
    }
    if (price <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Price must be positive.');
    }
    return price * quantity;
};

const checkIfConnected = async (uid: string | undefined) => {
    if (!uid) {
        throw new functions.https.HttpsError('unauthenticated', 'You need to be connected.');
    }
};

const checkIfStaff = async (uid: string | undefined) => {
    await checkIfConnected(uid);

    const staff = await admin.firestore().doc(`staffs/${uid}`).withConverter(staffConverter).get();
    if (!staff.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You are not a staff.');
    }

    return staff;
};

const checkIfAdmin = async (uid: string | undefined) => {
    const staff = await checkIfStaff(uid);
    const isAdmin = staff.data()?.isAdmin ?? false;
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'You are not an admin.');
    }
};

export const listPendingStaffs = functions.https.onCall(async (data, context) => {
    checkIfAdmin(context.auth?.uid);

    // There is always less than 1000 users
    const users = (await admin.auth().listUsers()).users;

    const staffsId = (await admin.firestore().collection('staffs').withConverter(staffConverter).get())
        .docs.map((s) => s.data().id);

    const pendingUsers = users.filter(({uid}) => !staffsId.includes(uid));

    return {
        users: pendingUsers.map((u) => ({
            uid: u.uid,
            name: u.displayName,
            email: u.email,
        })),
    } as ListPendingStaffs;
});

export const makeStaff = functions.https.onCall(async (data, context) => {
    checkIfAdmin(context.auth?.uid);

    const {uid, name} = (data as MakeStaffPayload);
    const staffRef = admin.firestore().doc(`staffs/${uid}`).withConverter(staffConverter);

    await staffRef.create({
        id: uid,
        name,
        isAvailable: false,
        isAdmin: false,
        phone: '1',
    });

    return {success: true};
});

/**
 * Make a pay transaction.
 * Check if the stock is available and if the user has provision for the payment.
 * Also check if it is still time for an order.
 *
 */
export const makeTransaction = functions.https.onCall(async (data, context) => {
    checkIfStaff(context.auth?.uid); // TODO change this so that users can order themselves
    const db = admin.firestore();
    const {account, productsWithQty} = (data as MakeTransactionPayload);
    const accountRef = db.doc(`accounts/${account.id}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
    const accountData = (await accountRef.get()).data();

    let priceProducts = 0;

    // Compute price, check user provision and check availability of products.
    for (let i = 0; i < productsWithQty.length; i++) {
        const productSnapshot = await db.doc(`products/${productsWithQty[i].product.id}`).withConverter(productConverter as unknown as FirestoreDataConverter<Product>).get();
        const productData = productSnapshot.data();
        if (!productData) {
            throw new functions.https.HttpsError('not-found', 'Product not found.');
        }
        // Do not trust user product price
        priceProducts += computeTotalPrice(productData.price, productsWithQty[i].quantity);

        if (productData.stock && productData.stock < productsWithQty[i].quantity) {
            throw new functions.https.HttpsError('resource-exhausted', 'Queried quantity exceeds remaining product stock.');
        }

        if (!productData.isAvailable) {
            throw new functions.https.HttpsError('unavailable', 'Product is unavailable');
        }
    }

    if (!accountData) {
        throw new functions.https.HttpsError('not-found', 'Account not found');
    }

    if (priceProducts > accountData.balance) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have enough provision on your account.');
    }

    // Write the transaction.
    const transactionRef = db.collection('transactions').doc();
    const staff = await db.doc(`staffs/${context.auth?.uid}`).withConverter(staffConverter).get();

    // TODO add time limit when users can order

    const batch = db.batch();
    batch.create(transactionRef, {
        id: '0',
        type: TransactionType.Order,
        productsWithQty: productsWithQty,
        price: priceProducts,
        isReady: false,
        customer: account,
        staff: staff.data(),
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
                stock: productData.stock - productsWithQty[i].quantity,
            });
        }
    }

    // Update balance. // TODO stats
    batch.update(accountRef, {
        balance: account.balance - priceProducts,
    });

    try {
        // Exécutez le batch
        await batch.commit();
        return {success: true};
    } catch (error) {
        console.error('An error occured during batching :', error);
        throw new functions.https.HttpsError('internal', 'An error occured during batching: ' + error);
    }
});
