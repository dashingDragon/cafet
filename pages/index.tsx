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
                <title>Cafet</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>

                {!firestoreUser
                    ? (
                        <PageLayout hideTopBar hideBottomNavigation>
                            <FullHeightScrollableContainer>
                                <LoadingScreen />
                            </FullHeightScrollableContainer>
                        </PageLayout>
                    )
                    : <>
                        {firestoreUser.isStaff && firestoreUser.isAvailable ? (
                            <PageLayout title={'Cafet'} hideBottomNavigation={!firestoreUser?.isAdmin}>
                                <FullHeightScrollableContainer>
                                    <StaffView />
                                </FullHeightScrollableContainer>
                            </PageLayout>
                        ) : (
                            <PageLayout hideTopBar hideBottomNavigation>
                                <FullHeightScrollableContainer>
                                    <CustomerView account={firestoreUser} />
                                </FullHeightScrollableContainer>
                            </PageLayout>
                        )}
                    </>
                }

            </main>
        </>
    );
};

export default OrderPage;
