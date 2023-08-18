import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useTodaysOrders } from '../lib/firestoreHooks';
import { OrderList } from '../components/orderList';
import { Box, Card, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from './_app';

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
                            <Stack
                                flexGrow={1}
                                direction="column"
                                pb={4}
                                overflow='auto'
                                maxHeight='100%'
                            >
                                <Card sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: '16px',
                                    borderRadius: '20px',
                                    overflow: 'visible',
                                    px: '32px',
                                    background: theme => theme.palette.mode === 'light'
                                        ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                                        : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                                }}>
                                    <Typography variant="h5" >Commandes</Typography>
                                    <Image
                                        loader={imageLoader}
                                        src={'/svg/cooking.svg'}
                                        alt={'Success image'}
                                        width={64}
                                        height={64}
                                    />
                                </Card>
                                <OrderList orders={orders} />
                            </Stack>
                        </>
                    }
                </PageLayout>
            </main>
        </>
    );
};

export default OrderPage;
