import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import LoadingScreen from '../components/loading';
import { useFirestoreUser } from '../lib/firestoreHooks';
import { StaffView } from '../components/staffView';
import { CustomerView } from '../components/customerView';
import FullHeightScrollableContainer from '../components/scrollableContainer';

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
                    ? (
                        <FullHeightScrollableContainer>
                            <LoadingScreen />
                        </FullHeightScrollableContainer>
                    )
                    : <>
                        {firestoreUser.isStaff && firestoreUser.isAvailable ? (
                            <PageLayout title={'Kafet'} hideBottomNavigation={!firestoreUser?.isAdmin}>
                                <FullHeightScrollableContainer>
                                    <StaffView />
                                </FullHeightScrollableContainer>
                            </PageLayout>
                        ) : (
                            <CustomerView account={firestoreUser} />
                        )}
                    </>
                }

            </main>
        </>
    );
};

export default OrderPage;
