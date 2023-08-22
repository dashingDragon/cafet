import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import { useGuardIsStaff } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useTodaysOrders } from '../lib/firestoreHooks';
import { OrderList } from '../components/orderList';
import { Box, ButtonGroup, Card, IconButton, Stack, Typography, styled } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from './_app';
import { countIngredients, ingredientsToCount } from '../lib/ingredients';
import { FormatListBulleted, Menu, RoomService } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Order, TransactionState } from '../lib/transactions';

const StyledTabButton = styled(IconButton)(({ theme }) => ({
    height: '60px',
    width: '100px',
    border: theme.palette.mode === 'light' ? `1px solid hsla(0, 0%, 70%, 1)` : `1px solid hsla(224, 6%, 69%, 1)`,
    background: theme.palette.mode === 'light' ? 'hsla(0, 0%, 94%, 1)' : 'hsla(224, 6%, 48%, 1)',
    borderRadius: '10px',
    '&:hover, &.selected': {
        cursor: 'pointer',
        background: 'transparent',
        border: `1px solid ${theme.colors.main}`,
    },
}));

const OrderPage: NextPage = () => {
    const staffUser = useGuardIsStaff();
    const orders = useTodaysOrders();
    const [ingredientsQuantities, setIngredientsQuantities] = useState<Record<string, number>>({});
    const [ordersInPreparation, setOrdersInPreparation] = useState([] as Order[]);
    const [ordersServed, setOrdersServed] = useState([] as Order[]);

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        console.log(orders);
        setIngredientsQuantities(countIngredients(orders));
        setOrdersInPreparation(orders.filter(o => o.transaction.state !== TransactionState.Served));
        setOrdersServed(orders.filter(o => o.transaction.state === TransactionState.Served));
    }, [orders]);

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

                                    <Stack direction="row" flexWrap={'wrap'}>
                                        {Object.entries(ingredientsQuantities).map(([name, quantity]) => (
                                            <Box key={name} width='50%' sx={{ display: 'flex', p: 1 }}>
                                                <Image
                                                    loader={imageLoader}
                                                    src={ingredientsToCount[name]}
                                                    alt={name}
                                                    height={36}
                                                    width={36}
                                                    className={'icon'}
                                                />
                                                <Typography ml={'16px'} fontSize={24} fontWeight={700}>
                                                    {quantity}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Card>

                                <ButtonGroup sx={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    mb: '16px',
                                    borderRadius: '20px',
                                    overflow: 'visible',
                                    width: '350px',
                                    display: 'flex',
                                    height: '100px',
                                }}>
                                    <StyledTabButton onClick={() => setTabIndex(0)} className={tabIndex === 0 ? 'selected' : ''}>
                                        <Menu />
                                    </StyledTabButton>
                                    <StyledTabButton onClick={() => setTabIndex(1)} className={tabIndex === 1 ? 'selected' : ''}>
                                        <FormatListBulleted />
                                    </StyledTabButton>
                                    <StyledTabButton onClick={() => setTabIndex(2)} className={tabIndex === 2 ? 'selected' : ''}>
                                        <RoomService />
                                    </StyledTabButton>
                                </ButtonGroup>
                                {tabIndex === 0 ? (
                                    <>
                                        {ordersInPreparation.length === 0 ? (
                                            <Stack direction="column" justifyContent="center" height="100%">
                                                <Typography variant="h3" sx={{ m: '32px' }}>
                                                    {'Il n\'y a aucune commande en attente.'}
                                                </Typography>
                                                <Image
                                                    loader={imageLoader}
                                                    src={'/svg/empty.svg'}
                                                    alt={'Success image'}
                                                    width={120}
                                                    height={120}
                                                />
                                            </Stack>
                                        ) : (
                                            <Typography variant="h5" mb={2}>
                                                Commandes en attente
                                            </Typography>
                                        )}
                                        <OrderList orders={ordersInPreparation} short />
                                    </>
                                ) : tabIndex === 1 ? (
                                    <>
                                        {ordersInPreparation.length === 0 ? (
                                            <Stack direction="column" justifyContent="center" height="100%">
                                                <Typography variant="h3" sx={{ m: '32px' }}>
                                                    {'Il n\'y a aucune commande en attente.'}
                                                </Typography>
                                                <Image
                                                    loader={imageLoader}
                                                    src={'/svg/empty.svg'}
                                                    alt={'Success image'}
                                                    width={120}
                                                    height={120}
                                                />
                                            </Stack>
                                        ) : (
                                            <Typography variant="h5" mb={2}>
                                                Commandes en attente
                                            </Typography>
                                        )}
                                        <OrderList orders={ordersInPreparation} />
                                    </>
                                ) : (
                                    <>
                                        {ordersServed.length === 0 ? (
                                            <Stack direction="column" justifyContent="center" height="100%">
                                                <Typography variant="h3" sx={{ m: '32px' }}>
                                                    {'Aucune commande n\'a été servie aujourd\'hui.'}
                                                </Typography>
                                                <Image
                                                    loader={imageLoader}
                                                    src={'/svg/empty.svg'}
                                                    alt={'Success image'}
                                                    width={120}
                                                    height={120}
                                                />
                                            </Stack>
                                        ) : (
                                            <Typography variant="h5" mb={2}>
                                                Commandes servies
                                            </Typography>
                                        )}
                                        <OrderList orders={ordersServed} />
                                    </>
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
