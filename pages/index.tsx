import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import { useGuardIsStaff } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useTodaysOrders } from '../lib/firestoreHooks';
import { OrderList } from '../components/orderList';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from './_app';
import { getBaguetteCount } from '../lib/ingredients';

const OrderPage: NextPage = () => {
    const staffUser = useGuardIsStaff();
    const orders = useTodaysOrders();

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'} hideBottomNavigation={!staffUser?.isAdmin}>
                    {orders === undefined || staffUser === undefined
                        ? <LoadingScreen />
                        : <>
                            <Stack
                                flexGrow={1}
                                direction="column"
                                pb={4}
                                overflow='auto'
                                maxHeight='100%'
                                alignItems='center'
                            >
                                <Card sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: '16px',
                                    mt: '48px',
                                    borderRadius: '20px',
                                    overflow: 'visible',
                                    px: '32px',
                                    height: '40px',
                                    width: '350px',
                                    background: theme => theme.palette.mode === 'light'
                                        ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                                        : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                                }}>
                                    <Typography variant="h5" >Commandes</Typography>
                                    <Box sx={{ marginTop: '-35px' }}>
                                        <Image
                                            loader={imageLoader}
                                            src={'/svg/orders.svg'}
                                            alt={'Success image'}
                                            width={90}
                                            height={90}
                                        />
                                    </Box>
                                </Card>
                                <Card sx={{
                                    mb: '16px',
                                    borderRadius: '20px',
                                    overflow: 'visible',
                                    px: '32px',
                                    py: '16px',
                                    width: '350px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}>
                                    <Image
                                        loader={imageLoader}
                                        src={'svg/baguette.png'}
                                        alt={'Baguettes '}
                                        height={36}
                                        width={36}
                                        className={'icon'}
                                    />
                                    <Typography ml={'16px'} fontSize={24} fontWeight={700}>
                                        {getBaguetteCount(orders)}
                                    </Typography>
                                </Card>
                                <OrderList orders={orders} />
                                {orders.length === 0 && (
                                    <Stack direction="column" justifyContent="center" height="100%">
                                        <Typography variant="h3" sx={{ m: '32px' }}>
                                            {'Aucune commande n\'a été passée.'}
                                        </Typography>
                                        <Image
                                            loader={imageLoader}
                                            src={'/svg/empty.svg'}
                                            alt={'Success image'}
                                            width={120}
                                            height={120}
                                        />
                                    </Stack>
                                )}
                            </Stack>
                        </>
                    }
                </PageLayout>
            </main>
        </>
    );
};

export default OrderPage;
