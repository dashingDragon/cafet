/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import type { } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {MakeStaffPayload, Staff, staffConverter as externalStaffConverter} from '../../lib/staffs';
import {ListPendingStaffs} from '../../lib/firebaseFunctionHooks';
import {FirestoreDataConverter} from '@google-cloud/firestore';
import {MakeTransactionPayload, TransactionOrder, TransactionType, transactionConverter} from '../../lib/transactions';
import {Account, accountConverter} from '../../lib/accounts';
import {Product, productConverter} from '../../lib/product';

const staffConverter = externalStaffConverter as unknown as FirestoreDataConverter<Staff>;

admin.initializeApp();

const computeTotalPrice = (product: Product, quantity: number ) => {
    return product?.price * quantity;
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
 * Write a transaction for the exchange and update
 * the account's balance and stats.
 *
 * @returns a function to make the transation
 */
export const makeTransaction = functions.https.onCall(async (data, context) => {
    checkIfStaff(context.auth?.uid); // TODO change this so that users can order themselves
    const {account, productsWithQty} = (data as MakeTransactionPayload);

    let priceProducts = 0;

    // compute price and check availability of products
    for (let i = 0; i < productsWithQty.length; i++) {
        priceProducts += computeTotalPrice(productsWithQty[i].product, productsWithQty[i].quantity);
        const productSnapshot = await admin.firestore().doc(`products/${productsWithQty[i].product.id}`).withConverter(productConverter as unknown as FirestoreDataConverter<Product>).get();
        const productData = productSnapshot.data();
        if (!productData) {
            throw new functions.https.HttpsError('not-found', 'Product not found.');
        }

        if (productData.stock && productData.stock < productsWithQty[i].quantity) {
            throw new functions.https.HttpsError('resource-exhausted', 'Queried quantity exceeds remaining product stock.');
        }
    }

    // write the transaction
    const transactionRef = admin.firestore().doc('transactions').withConverter(transactionConverter as unknown as FirestoreDataConverter<TransactionOrder>);
    const accountRef = admin.firestore().doc(`accounts/${account.id}`).withConverter(accountConverter as unknown as FirestoreDataConverter<Account>);
    const staff = await admin.firestore().doc(`staffs/${context.auth?.uid}`).withConverter(staffConverter).get();

    const batch = admin.firestore().batch();
    batch.create(transactionRef, {
        id: '0',
        type: TransactionType.Order,
        productsWithQty: productsWithQty,
        price: priceProducts,
        customer: account,
        staff: staff,
        createdAt: new Date(),
    });

    // Balance & stats
    batch.update(accountRef, {
        balance: account.balance - priceProducts,
    });

    try {
        // Exécutez le batch
        await batch.commit();
        return {message: 'Mise à jour en lot réussie.'};
    } catch (error) {
        console.error('Erreur lors de la mise à jour en lot :', error);
        throw new functions.https.HttpsError('internal', 'Une erreur est survenue lors de la mise à jour en lot.');
    }
});
