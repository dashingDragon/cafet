import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Account, AccountStats, School, accountConverter } from './accounts';
import { useGuardIsAdmin, useGuardIsConnected } from './hooks';
import { Order, Transaction, TransactionOrder, TransactionState, TransactionType, transactionConverter } from './transactions';
import { Product, ProductWithQty, productConverter, productType } from './products';
import { Ingredient, ingredientCategory, ingredientConverter, parseIngredients } from './ingredients';
import { Stat, statConverter } from './stats';
import { useRouter } from 'next/router';
import { useGetFirestoreUser } from './firebaseFunctionHooks';
import logger from './logger';

// =================== Staff stuff ===================
/**
 * Get the current user info from the database.
 *
 * @returns the currently logged in user Account.
 */
export const useFirestoreUser = () => {
    const db = getFirestore();
    const router = useRouter();
    const user = useGuardIsConnected();
    const [firestoreUser, setFirestoreUser] = useState<Account | undefined>(undefined);
    const getFirestoreUser = useGetFirestoreUser();

    useEffect(() => {
        if (user) {
            const q = doc(db, `accounts/${user.uid}`).withConverter(accountConverter);
            return onSnapshot(q, (snapshot) => {
                const firestoreUserData = snapshot.data();
                if (!firestoreUserData) {
                    console.error('Failed to fetch firestore user data.');
                    router.replace('/register');
                } else {
                    setFirestoreUser(firestoreUserData);
                }
            }, async (error) => {
                const result = await getFirestoreUser();
                if (result.data.success) {
                    if (result.data.account) {
                        setFirestoreUser(result.data.account);
                    } else {
                        logger.log('User does not exist');
                        router.replace('/register');
                    }
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return firestoreUser;
};

/**
 * Fetch the list of staff users in the database.
 *
 * @returns the staff array.
 */
export const useStaffs = () => {
    const db = getFirestore();
    const [staffs, setStaffs] = useState<Account[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, 'accounts'),
            where('isStaff', '==', true)
        ).withConverter(accountConverter);

        return onSnapshot(q, (snapshot) => {
            const staffs = snapshot.docs.map((a) => a.data());

            setStaffs(staffs.sort((a, b) => a.firstName < b.firstName ? -1 : 1));
        });
    }, [db]);

    return staffs;
};

/**
 * Update the availabilty status of a staff.
 *
 * @returns a function to change staffs availability.
 */
export const useSetStaffAvailability = () => {
    const db = getFirestore();

    return async (account: Account, isAvailable: boolean) => {
        await updateDoc(doc(db, `accounts/${account.id}`).withConverter(accountConverter), {
            isAvailable,
        });
    };
};

/**
 * Update the staff status of an account.
 *
 * @returns a function to change an account staff status
 */
export const useMakeStaff = () => {
    const db = getFirestore();

    return async (account: Account, isStaff: boolean) => {
        await updateDoc(doc(db, `accounts/${account.id}`).withConverter(accountConverter), {
            isStaff,
        });
    };
};

// =================== Stats stuff ===================
/**
 * Return the profits and quantity of products, drinks and snacks sold.
 * Also return the amount of money recharged.
 */
export const useCurrentStats = () => {
    const db = getFirestore();

    const [stats, setStats] = useState<Stat>({
        id: '0',
        totalMoneySpent: 0,
        servingsOrdered: 0,
        drinksOrdered: 0,
        snacksOrdered: 0,
    });

    useEffect(() => {
        const q = doc(db, `stats/0`).withConverter(statConverter);
        return onSnapshot(q, (snapshot) => {
            const stats = snapshot.data();
            if (stats) {
                setStats(stats);
            }

        });
    }, [db, stats]);

    return stats;
};

/**
 * Return the money spent and quantity of products, drinks and snacks bought by a single account.
 */
export const useCurrentStatsForAccount = (account: Account) => {
    const db = getFirestore();
    const [stats, setStats] = useState<AccountStats>({
        totalMoneySpent: 0,
        servingsOrdered: 0,
        drinksOrdered: 0,
        snacksOrdered: 0,
    });

    useEffect(() => {
        const q = doc(db, `accounts/${account.id}`).withConverter(accountConverter);
        return onSnapshot(q, (snapshot) => {
            const accountData = snapshot.data();
            if (accountData) {
                setStats(accountData.stats);
            }

        });
    }, [db, account]);

    return stats;
};

// export const useCurrentStatsForProducts = () => {
//     const db = getFirestore();
//     const products = useProducts();

//     const [productsStats, setProductsStats] = useState(new Map<string, { product: Product, quantity: number, money: number }>());

//     useEffect(() => {
//         const transactionOrder = query(
//             collection(db, `transactions`),
//             where('type', '==', TransactionType.Order),
//         ).withConverter(transactionConverter);

//         return onSnapshot(transactionOrder, (snapshot) => {
//             const transactions = snapshot.docs.map((a) => a.data());

//             // Setup map
//             const _productsStats = new Map();
//             products.forEach((p) => {
//                 _productsStats.set(p.id, { product: p, quantity: 0, money: 0 });
//             });

//             // Fill it with the transactions
//             transactions.forEach((transaction) => {
//                 const order = transaction as TransactionOrder;
//                 for (let i = 0; i < order.productsWithQty.length; i++) {
//                     const id = order.productsWithQty[i].product.id;
//                     if (_productsStats.has(id)) {
//                         const { product, quantity, money } = _productsStats.get(id);
//                         _productsStats.set(id, {
//                             product,
//                             quantity: quantity + order.productsWithQty[i],
//                             money: money + order.productsWithQty[i].quantity * product.price,
//                         });
//                     }
//                 }
//             });

//             setProductsStats(_productsStats);
//         });
//     }, [db, products]);

//     return [Array.from(productsStats.values())];
// };

// =================== Accounts stuff ===================
/**
 * Fetch the accounts list in the database.
 *
 * @returns the accounts array.
 */
export const useAccountList = () => {
    const db = getFirestore();
    const [accounts, setAccounts] = useState([] as Account[]);

    useEffect(() => {
        const q = query(collection(db, 'accounts'), orderBy('lastName', 'asc'), orderBy('firstName', 'asc')).withConverter(accountConverter);
        logger.log(q);
        return onSnapshot(q, (snapshot) => {
            setAccounts(snapshot.docs.map((a) => a.data()));
        });
    }, [db]);

    return accounts;
};

/**
 * Fetch the account's information from the database.
 *
 * @param id account's id
 * @returns the account corresponding to the id
 */
export const useAccount = (id: string) => {
    const db = getFirestore();
    const [account, setAccount] = useState(undefined as Account | undefined);

    useEffect(() => {
        const q = doc(db, `accounts/${id}`).withConverter(accountConverter);
        return onSnapshot(q, (snapshot) => {
            setAccount(snapshot.data());
        });
    }, [db, id]);

    return account;
};

/**
 * Get function to make an account.
 *
 * @returns an account maker function
 */
export const useAccountMaker = () => {
    const db = getFirestore();

    return async (firstName: string, lastName: string, school: School, phone: string, email: string) => {
        logger.log(`Create account for ${firstName} ${lastName} ${school}`);
        return await addDoc(collection(db, 'accounts').withConverter(accountConverter), {
            id: '',
            firstName,
            lastName,
            isStaff: false,
            isAdmin: false,
            isAvailable: false,
            phone,
            email,
            school,
            isLinkedToGoogle: false,
            favorites: [],
            balance: 0,
            stats: {
                totalMoneySpent: 0,
                servingsOrdered: 0,
                drinksOrdered: 0,
                snacksOrdered: 0,
            },
        });
    };
};

/**
 * Get the function to edit an account name or school.
 *
 * @returns an edit account function
 */
export const useAccountEditor = () => {
    const db = getFirestore();

    return async (account: Account, firstName: string, lastName: string, school: School, phone: string, email: string) => {
        logger.log(`Updating ${firstName} ${lastName}`);
        await updateDoc(doc(db, `accounts/${account.id}`).withConverter(accountConverter), { firstName, lastName, school, phone, email });
    };
};

/**
 * Get the function to delete an account.
 *
 * @returns a delete account function
 */
export const useAccountDeleter = () => {
    const db = getFirestore();

    return async (account: Account) => {
        logger.log(`Deleting ${account.firstName} ${account.lastName}`);
        await deleteDoc(doc(db, `accounts/${account.id}`));
    };
};

// =================== Product stuff ===================
export const useProductMaker = () => {
    const db = getFirestore();

    return async (
        id: string,
        type: productType,
        name: string,
        isAvailable: boolean,
        image: string,
        sizeWithPrices: Record<string, number>,
        ingredients: Ingredient[],
        stock: number
    ) => {
        logger.log('Create product');
        if (type === 'serving') {
            const {isVege, isVegan, allergen, description} = parseIngredients(ingredients);

            return await addDoc(collection(db, 'products').withConverter(productConverter), {
                id,
                type,
                name,
                isAvailable,
                image,
                sizeWithPrices,
                isVege,
                isVegan,
                allergen,
                ingredients,
                description,
            });
        } else {
            return await addDoc(collection(db, 'products').withConverter(productConverter), {
                id,
                type,
                name,
                isAvailable,
                image,
                sizeWithPrices,
                stock,
            });
        }
    };
};
/**
 * Fetch the list of existing products from the database.
 *
 * @returns an array of Products type
 */
export const useProducts = () => {
    const db = getFirestore();
    const [products, setProducts] = useState([] as Product[]);

    useEffect(() => {
        const q = collection(db, 'products').withConverter(productConverter);
        return onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map((b) => b.data()));
        });
    }, [db]);

    return products;
};

/**
 * Get the function to edit a product.
 *
 * @returns an edit product function
 */
export const useProductEditor = () => {
    const db = getFirestore();

    return async (
        product: Product,
        type: productType,
        name: string,
        isAvailable: boolean,
        image: string,
        sizeWithPrices: Record<string, number>,
        ingredients: Ingredient[],
        stock: number
    ) => {
        logger.log(`Updating ${name}`);
        if (type === 'serving') {
            const {isVege, isVegan, allergen, description} = parseIngredients(ingredients);
            logger.log(type,
                name,
                isAvailable,
                image,
                sizeWithPrices,
                isVege,
                isVegan,
                allergen,
                ingredients,
                description
            );
            return await updateDoc(doc(db, `products/${product.id}`).withConverter(productConverter), {
                type,
                name,
                isAvailable,
                image,
                sizeWithPrices,
                isVege,
                isVegan,
                allergen,
                ingredients,
                description,
            });
        } else {
            return await updateDoc(doc(db, `products/${product.id}`).withConverter(productConverter), {
                type,
                name,
                isAvailable,
                image,
                sizeWithPrices,
                stock,
            });
        }
    };
};

/**
 * Get the function to delete a product.
 *
 * @returns a delete account function
 */
export const useProductDeleter = () => {
    const db = getFirestore();

    return async (product: Product) => {
        logger.log(`Deleting ${product.name}`);
        await deleteDoc(doc(db, `products/${product.id}`));
    };
};

// =================== Ingredients stuff ===================
export const useIngredientMaker = () => {
    const db = getFirestore();

    return async ({ id, name, category, isVege, isVegan, price, allergen, image, acronym }: Ingredient) => {
        logger.log('Create ingredient');
        return await addDoc(collection(db, 'ingredients').withConverter(ingredientConverter), {
            id,
            name,
            category,
            isVege,
            isVegan,
            price,
            allergen,
            image,
            acronym,
        });
    };
};

/**
 * Fetch the list of existing ingredients from the database.
 *
 * @returns an array of Ingredients type
 */
export const useIngredients = () => {
    const db = getFirestore();
    const [ingredients, setIngredients] = useState([] as Ingredient[]);

    useEffect(() => {
        const q = collection(db, 'ingredients').withConverter(ingredientConverter);
        return onSnapshot(q, (snapshot) => {
            setIngredients(snapshot.docs.map((b) => b.data()));
        });
    }, [db]);

    return ingredients;
};

/**
 * Get the function to edit a ingredient.
 *
 * @returns an edit ingredient function
 */
export const useIngredientEditor = () => {
    const db = getFirestore();

    return async (
        ingredient: Ingredient,
        name: string,
        category: ingredientCategory,
        isVege: boolean,
        isVegan: boolean,
        price: number,
        allergen: string,
        image: string,
        acronym: string,
    ) => {
        logger.log(`Updating ${name}`);
        await updateDoc(doc(db, `ingredients/${ingredient.id}`).withConverter(ingredientConverter), {
            name,
            category,
            isVege,
            isVegan,
            price,
            allergen,
            image,
            acronym,
        });
    };
};

/**
 * Get the function to delete a ingredient.
 *
 * @returns a delete account function
 */
export const useIngredientDeleter = () => {
    const db = getFirestore();

    return async (ingredient: Ingredient) => {
        logger.log(`Deleting ${ingredient.name}`);
        await deleteDoc(doc(db, `ingredients/${ingredient.id}`));
    };
};

// =================== Transactions stuff ===================
/**
 * Recharge an account with a given amount.
 *
 * @returns a function to recharge an account
 */
export const useRechargeTransactionMaker = () => {
    const db = getFirestore();
    const firestoreAdminUser = useGuardIsAdmin();

    if (!firestoreAdminUser) return () => alert('Please wait until we confirm that you are an admin.');

    return async (account: Account, amount: number): Promise<{
        success: boolean,
        message: string,
    }> => {
        try {
            const accountRef = doc(db, `accounts/${account.id}`).withConverter(accountConverter);
            const transactionRef = doc(collection(db, `transactions`)).withConverter(transactionConverter);

            const docSnapshot = await getDoc(accountRef);
            if (!docSnapshot.exists()) {
                return {success: false, message: 'Account not found'};
            }
            if (!transactionRef) {
                return {success: false, message: 'Transactions collection not found'};
            }
            
            const batch = writeBatch(db);
            batch.set(transactionRef, {
                id: '0',
                type: TransactionType.Recharge,
                amount: amount,
                customer: account,
                admin: firestoreAdminUser,
                createdAt: Timestamp.fromDate(new Date()),
            });
            batch.update(accountRef, {
                balance: account.balance + amount,
            });

            await batch.commit();
            return {success: true, message: 'Account successfully updated'};
        } catch (e) {
            return {success: false, message: String(e)};
        }
    };
};

/**
 * Get the transaction history of given user.
 *
 * @param account User account
 * @returns the array of user's transactions
 */
export const useTransactionHistory = (account: Account) => {
    const db = getFirestore();
    const products = useProducts();

    const [transactions, setTransactions] = useState([] as Transaction[]);

    useEffect(() => {
        const transaction = query(
            collection(db, `transactions`),
            where('customer.id', '==', account.id),
        ).withConverter(transactionConverter);

        return onSnapshot(transaction, (snapshot) => {
            const _transactions = snapshot.docs.map((a) => a.data());
            logger.log(_transactions);
            if (_transactions) {
                setTransactions(_transactions);
            }

        });
    }, [account.id, db, products]);

    return transactions;
};

/**
 * Get the list of today's orders in chronological order.
 *
 * @returns the array of today's orders
 */
export const useTodaysOrders = () => {
    const db = getFirestore();
    const [transactions, setTransactions] = useState([] as Order[]);

    const startOfDay = new Date();
    const endOfDay = new Date();
    if (startOfDay.getHours() < 22) {
        startOfDay.setDate(startOfDay.getDate() - 1); // Go back one day
    } else {
        endOfDay.setDate(endOfDay.getDate() + 1);
    }
    startOfDay.setHours(22, 0, 0, 0);
    endOfDay.setHours(21, 59, 59, 0);

    useEffect(() => {
        const transactionQuery = query(
            collection(db, 'transactions'),
            where('createdAt', '>=', startOfDay),
            where('createdAt', '<', endOfDay),
            where('type', '==', TransactionType.Order)
        ).withConverter(transactionConverter);

        return onSnapshot(transactionQuery, (snapshot) => {
            const _transactions = snapshot.docs.map((a) => a.data());
            logger.log(_transactions);
            if (_transactions) {
                setTransactions(
                    (_transactions as TransactionOrder[]).sort((a, b) => +a.createdAt - +b.createdAt).map((t, i) =>
                        ({
                            id: i + 1,
                            transaction: t,
                        } as Order)
                    )
                );
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db]);

    return transactions;
};

/**
 * Update the transaction state.
 *
 * @returns a function to update order state
 */
export const useUpdateOrderStatus = () => {
    const db = getFirestore();
    const admin = useFirestoreUser();

    return async (transaction: TransactionOrder, state: TransactionState): Promise<{
        success: boolean,
        message: string,
    }> => {
        logger.log(`Updating transaction ${transaction.id} status`);

        if (state === TransactionState.Served) { /** Serve order */
            try {
                /** Update the order document with the new Served state and the admin who served the order */
                await updateDoc(doc(db, `transactions/${transaction.id}`), {
                    state,
                    admin,
                });
                return {success: true, message: 'Order served'};
            } catch (error) {
                return {success: false, message: 'Error'};
            }
        } else if (state === TransactionState.Ready) { /** Make order ready to be served */
            try {
                /** Update the order document with the new Ready state and the admin who prepared the order */
                await updateDoc(doc(db, `transactions/${transaction.id}`), {
                    state,
                    admin,
                });
                return {success: true, message: 'Order ready'};
            } catch (error) {
                return {success: false, message: 'Error'};
            }
        } else if (state === TransactionState.Cancelled) { /** Cancel order */
            logger.log(transaction);
            try {
                const batch = writeBatch(db);

                // Update the products stocks.
                for (const productWithQty of transaction.productsWithQty) {
                    const productRef = doc(db, `products/${productWithQty.product.id}`).withConverter(productConverter);
                    const productData = (await getDoc(productRef)).data();
                    if (productData && productData.stock !== undefined) {
                        batch.update(productRef, {
                            stock: productData.stock + Object.values(productWithQty.sizeWithQuantities).reduce((a, b) => a + b),
                        });
                    }
                }

                // Update the transaction state.
                batch.update(doc(db, `transactions/${transaction.id}`), {
                    state,
                    admin,
                });

                try {
                    await batch.commit();
                    return {success: true, message: 'Order cancelled'};
                } catch {
                    return {success: false, message: 'Error cancelling order'};
                }

            } catch (error) {
                return {success: false, message: 'Error'};
            }
        } else {
            return {success: false, message: 'New state not compatible.'};
        }
    };
};

/**
 * Cash in a transaction.
 * Stocks and customer provision need to be enough.
 *
 * @param transaction transaction to cash in
 * @returns the success or error message
 */
export const cashInTransaction = async (transaction: TransactionOrder): Promise<{
    success: boolean,
    message: string,
}> => {
    try {
        const db = getFirestore();
        const oldTransactionAccount = transaction.customer;

        // Update the global stats
        const statsRef = doc(db, 'stats/0').withConverter(statConverter);
        const statsData = (await getDoc(statsRef)).data();
        const accountRef = doc(db, `accounts/${oldTransactionAccount.id}`).withConverter(accountConverter);
        const accountData = (await getDoc(accountRef)).data();

        if (!statsData) {
            return {success: false, message: 'Could not access global stats.'};
        }

        if (!accountData) {
            console.error('Could not find account.');
            return {success: false, message: 'Could not find account.'};
        }

        if (accountData.balance < transaction.price) {
            return {success: false, message: 'Account does not have enough provision.'};
        }

        const quantityOrdered = {
            'serving': 0,
            'drink': 0,
            'snack': 0,
        };
        for (let i = 0; i < transaction.productsWithQty.length; i++) {
            const productWithQtySize = transaction.productsWithQty[i];

            Object.entries(productWithQtySize.sizeWithQuantities).forEach(([size, quantity]) => {
                quantityOrdered[productWithQtySize.product.type] += quantity;
            });
        }

        const batch = writeBatch(db);
        batch.update(statsRef, {
            totalMoneySpent: statsData.totalMoneySpent += transaction.price,
            servingsOrdered: statsData.servingsOrdered += quantityOrdered['serving'],
            drinksOrdered: statsData.drinksOrdered += quantityOrdered['drink'],
            snacksOrdered: statsData.snacksOrdered += quantityOrdered['snack'],
        });

        // Update balance.
        batch.update(accountRef, {
            balance: accountData.balance - transaction.price,
            stats: {
                totalMoneySpent: accountData.stats.totalMoneySpent += transaction.price,
                servingsOrdered: accountData.stats.servingsOrdered += quantityOrdered['serving'],
                drinksOrdered: accountData.stats.drinksOrdered += quantityOrdered['drink'],
                snacksOrdered: accountData.stats.snacksOrdered += quantityOrdered['snack'],
            },
        });

        try {
            await batch.commit();
            return {success: true, message: 'Order cashed in'};
        } catch {
            return {success: false, message: 'Error committing order'};
        }

    } catch (error) {
        return {success: false, message: 'Error'};
    }
};

export const useOrder = (orderId: string) => {
    const db = getFirestore();

    const [order, setOrder] = useState<Transaction>();

    useEffect(() => {
        const q = doc(db, `transactions/${orderId}`).withConverter(transactionConverter);
        return onSnapshot(q, (snapshot) => {

            const _order = snapshot.data();
            logger.log(orderId);
            if (_order) {
                setOrder(_order);
            }

        });
    }, [db, orderId]);

    return order;
};

type OrderPayload = {
    order: TransactionOrder,
    productsWithQty: ProductWithQty[],
    price: number,
    needPreparation: boolean
}

/**
 * Edit order products with quantities and sizes.
 *
 * Updates order price and state blindly.
 *
 * @returns a function to edit an order
 */
export const useOrderEditor = () => {
    const db = getFirestore();
    const admin = useFirestoreUser();

    return async ({order, productsWithQty, price, needPreparation }: OrderPayload): Promise<{ success: boolean; message: string; }> => {
        logger.log(`Updating order ${order.id}`);
        logger.log(order);
        logger.log(productsWithQty);
        // check if account has enough provision
        const accountData = (await getDoc(doc(db, `accounts/${order.customer.id}`).withConverter(accountConverter))).data();
        if (!accountData) {
            return {success: false, message: `Customer ${order.customer.lastName} not found.`};
        }
        if (accountData.balance < price) {
            return {success: false, message: 'Customer does not have enough provision.'};
        }

        try {
            const batch = writeBatch(db);

            // Update the products stocks.
            for (const productWithQty of productsWithQty) {
                const prevProductWithQty = order.productsWithQty.filter(p => p.product.id === productWithQty.product.id)[0];
                logger.log(`prev product`);
                logger.log(prevProductWithQty);
                logger.log(`product`);
                logger.log(productWithQty);
                const productRef = doc(db, `products/${productWithQty.product.id}`).withConverter(productConverter);
                const productData = (await getDoc(productRef)).data();
                if (!productData) {
                    return {success: false, message: `Product ${productWithQty.product.name} not found.`};
                }
                logger.log(`productData`);
                logger.log(productData);
                if (productData.stock !== undefined) {
                    const newStock = productData.stock
                    + Object.values(prevProductWithQty.sizeWithQuantities).reduce((a, b) => a + b)
                    - Object.values(productWithQty.sizeWithQuantities).reduce((a, b) => a + b);

                    if (newStock < 0) {
                        return {success: false, message: `Product ${productWithQty.product.name} is out of stock.`};
                    }
                    logger.log(`new stock: ${newStock}`);
                    batch.update(productRef, {
                        stock: newStock,
                    });
                }
            }

            // Restore the stocks for removed products
            for (const productWithQty of order.productsWithQty) {
                if (!productsWithQty.map(p => p.product.id).includes(productWithQty.product.id)) {
                    logger.log(`${productWithQty.product.name} was removed from the order.`);
                    const productRef = doc(db, `products/${productWithQty.product.id}`).withConverter(productConverter);
                    const productData = (await getDoc(productRef)).data();
                    if (!productData) {
                        return {success: false, message: `Product ${productWithQty.product.name} not found.`};
                    }
                    if (productData.stock !== undefined) {
                        logger.log(`update stock of ${productWithQty.product.name}`);
                        const newStock = productData.stock
                        + Object.values(productWithQty.sizeWithQuantities).reduce((a, b) => a + b);

                        batch.update(productRef, {
                            stock: newStock,
                        });
                    }
                }
            }

            // update transaction
            const transactionRef = doc(db, `transactions/${order.id}`).withConverter(transactionConverter);
            batch.update(transactionRef, {
                productsWithQty,
                price,
                state: needPreparation ? order.state : TransactionState.Served,
                admin: admin,
            });

            // if the order is served now, update customer balance
            if (!needPreparation) {
                batch.update(doc(db, `accounts/${accountData.id}`), {
                    balance: accountData.balance - price,
                });

                await batch.commit();
                return {success: true, message: 'Order succesfully cashed in.'};
            }

            await batch.commit();
            return {success: true, message: 'Order succesfully updated.'};
        } catch {
            return {success: false, message: 'An error occured'};
        }
    };
};


