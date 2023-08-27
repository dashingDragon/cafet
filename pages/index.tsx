import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import LoadingScreen from '../components/loading';
import { useFirestoreUser } from '../lib/firestoreHooks';
import { OrdersForStaffs } from '../components/ordersForStaffs';
import { OrdersForCustomers } from '../components/ordersForCustomers';
import { Order } from '../lib/transactions';

const OrderPage: NextPage = () => {
    const firestoreUser = useFirestoreUser();

    const orders = [] as Order[]; // useTodaysOrders();

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'} hideBottomNavigation={!firestoreUser?.isAdmin}>
                    {orders === undefined || !firestoreUser
                        ? <LoadingScreen />
                        : <>
                            {firestoreUser.isStaff ? (
                                <OrdersForStaffs orders={orders} />
                            ) : (
                                <OrdersForCustomers orders={orders} />
                            )}
                        </>
                    }
                </PageLayout>
            </main>
        </>
    );
};

export default OrderPage;
