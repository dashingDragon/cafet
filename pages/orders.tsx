import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useTodaysOrders } from '../lib/firestoreHooks';
import { OrderList } from '../components/orderList';
import { Typography } from '@mui/material';

const OrderPage: NextPage = () => {
    useGuardIsConnected();
    const orders = useTodaysOrders();

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    {orders === undefined
                        ? <LoadingScreen />
                        : <>
                            <FullHeightScrollableContainer sx={{ position: 'relative' }}>
                                <>
                                    <Typography variant="h5" m={1}>Commandes</Typography>
                                    <OrderList orders={orders} />
                                </>
                            </FullHeightScrollableContainer>
                        </>
                    }
                </PageLayout>
            </main>
        </>
    );
};

export default OrderPage;
