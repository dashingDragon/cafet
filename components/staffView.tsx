import { Box, Card, Stack, Typography, styled } from '@mui/material';
import { countIngredients, ingredientsToCount } from '../lib/ingredients';
import { imageLoader } from '../pages/_app';
import { OrderList } from './lists/orderList';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Order, TransactionState } from '../lib/transactions';
import { useTodaysOrders } from '../lib/firestoreHooks';
import { Carousel, CarouselItem } from './carousel';

const carouselItems = [
    {
        label: 'Commandes',
        icon: '/png/order.png',
    },
    {
        label: 'Détails',
        icon: '/png/info.png',
    },
    {
        label: 'Service',
        icon: '/png/service.png',
    },
] as CarouselItem[];

export const StaffView: React.FC = () => {
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
            {/* Shopping list */}
            <Card sx={{
                borderRadius: '20px',
                overflow: 'visible',
                px: '32px',
                py: '16px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Typography variant='h5'>
                    Liste de courses
                </Typography>
                <Stack direction="row" flexWrap={'wrap'}>
                    {Object.entries(ingredientsQuantities).map(([name, quantity]) => (
                        <Box key={name} width='50%' sx={{ display: 'flex', alignItems: 'flex-end', p: 1 }}>
                            <Image
                                loader={imageLoader}
                                src={ingredientsToCount[name]}
                                alt={name}
                                height={36}
                                width={36}
                                className={'icon'}
                            />
                            <Typography ml={'16px'} fontSize={16} fontWeight={700} sx={{ opacity: quantity ? 1 : 0.7 }}>
                                {quantity}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Card>

            {/* Menu tabs */}
            <Carousel carouselItems={carouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
            {tabIndex === 0 ? (
                <>
                    {ordersInPreparation.length === 0 ? (
                        <Stack direction="column" justifyContent="center" height="100%">
                            <Typography variant="h5" sx={{ my: '32px' }}>
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
                            <Typography variant="h5" sx={{ my: '32px' }}>
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
                            <Typography variant="h5" sx={{ my: '32px' }}>
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
        </>
    );
};