import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import LoadingScreen from '../components/loading';
import { useFirestoreUser } from '../lib/firestoreHooks';
import { OrdersForStaffs } from '../components/ordersForStaffs';
import { CustomerPage } from '../components/customer';

const OrderPage: NextPage = () => {
    const firestoreUser = useFirestoreUser();

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                {!firestoreUser
                    ? <LoadingScreen />
                    : <>
                        {firestoreUser.isStaff ? (
                            <PageLayout title={'Kafet'} hideBottomNavigation={!firestoreUser?.isAdmin}>
                                <OrdersForStaffs />
                            </PageLayout>
                        ) : (
                            <CustomerPage />
                        )}
                    </>
                }
            </main>
        </>
    );
};

export default OrderPage;
