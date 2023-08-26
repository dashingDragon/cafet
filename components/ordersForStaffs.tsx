import { Box, Card, Stack, Typography, styled } from '@mui/material';
import { countIngredients, ingredientsToCount } from '../lib/ingredients';
import { imageLoader } from '../pages/_app';
import { OrderList } from './lists/orderList';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Order, TransactionState } from '../lib/transactions';

const TabItem = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover, &.selected': {
        cursor: 'pointer',
    },
}));

const TabImage = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    background: theme.palette.background.paper,
    width: '64px',
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
    '&.selected': {
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
            : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
    },
}));

export const OrdersForStaffs: React.FC<{orders: Order[]}> = ({ orders }) => {
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
        <Stack
            flexGrow={1}
            direction="column"
            pb={4}
            overflow='auto'
            maxHeight='100%'
            alignItems='center'
        >
            {/* Shopping list */}
            <Card sx={{
                m: '16px',
                borderRadius: '20px',
                overflow: 'visible',
                px: '32px',
                py: '16px',
                width: '350px',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Typography variant='h5'>
                                        Liste de courses
                </Typography>
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

            {/* Menu tabs */}
            <Stack sx={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                mb: '16px',
                borderRadius: '20px',
                overflow: 'visible',
                width: '350px',
                display: 'flex',
                height: '100px',
            }}>
                <TabItem onClick={() => setTabIndex(0)}>
                    <TabImage className={tabIndex === 0 ? 'selected' : ''}>
                        <Image
                            loader={imageLoader}
                            src={'/png/order.png'}
                            alt={'Success image'}
                            width={48}
                            height={48}
                        />
                    </TabImage>
                    <Typography fontSize={10} sx={{
                        ...(tabIndex === 0 && ({
                            fontWeight: 700,
                            fontSize: '12px',
                            color: theme => theme.palette.mode === 'light' ? 'rgba(223,191,209,1)' : 'rgba(126,105,117,1)',
                        })),
                    }}>
                                            Commandes
                    </Typography>
                </TabItem>
                <TabItem onClick={() => setTabIndex(1)}>
                    <TabImage className={tabIndex === 1 ? 'selected' : ''}>
                        <Image
                            loader={imageLoader}
                            src={'/png/info.png'}
                            alt={'Success image'}
                            width={48}
                            height={48}
                        />
                    </TabImage>
                    <Typography fontSize={10} sx={{
                        ...(tabIndex === 1 && ({
                            fontWeight: 700,
                            fontSize: '12px',
                            color: theme => theme.palette.mode === 'light' ? 'rgba(223,191,209,1)' : 'rgba(126,105,117,1)',
                        })),
                    }}>
                                            Détails
                    </Typography>
                </TabItem>
                <TabItem onClick={() => setTabIndex(2)}>
                    <TabImage className={tabIndex === 2 ? 'selected' : ''}>
                        <Image
                            loader={imageLoader}
                            src={'/png/service.png'}
                            alt={'Success image'}
                            width={48}
                            height={48}
                        />
                    </TabImage>

                    <Typography fontSize={10} sx={{
                        ...(tabIndex === 2 && ({
                            fontWeight: 700,
                            fontSize: '12px',
                            color: theme => theme.palette.mode === 'light' ? 'rgba(223,191,209,1)' : 'rgba(126,105,117,1)',
                        })),
                    }}>
                                            Service
                    </Typography>
                </TabItem>
            </Stack>
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
    );
};