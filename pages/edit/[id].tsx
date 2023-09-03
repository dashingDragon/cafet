import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoadingScreen from '../../components/loading';
import PageLayout from '../../components/pageLayout';
import { useOrder } from '../../lib/firestoreHooks';
import { useGuardIsAdmin } from '../../lib/hooks';
import FullHeightScrollableContainer from '../../components/scrollableContainer';
import ProductMenu from '../../components/productMenu';
import { TransactionOrder } from '../../lib/transactions';

const EditOrderPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const router = useRouter();
    const { id } = router.query;
    const order = useOrder(id as string);

    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                {order === undefined || admin === undefined
                    ? <>
                        <PageLayout title="Éditer commande" hideBottomNavigation backTo={`/`}>
                            <LoadingScreen />
                        </PageLayout>
                    </>
                    : <>
                        <PageLayout title={`Éditer commande`} hideBottomNavigation backTo={`/`}>
                            <FullHeightScrollableContainer>
                                <ProductMenu account={order.customer} order={order as TransactionOrder} />
                            </FullHeightScrollableContainer>
                        </PageLayout>
                    </>
                }

            </main>
        </>
    );
};

export default EditOrderPage;
