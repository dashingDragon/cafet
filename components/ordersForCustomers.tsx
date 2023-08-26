import { Stack, Typography } from '@mui/material';
import { imageLoader } from '../pages/_app';
import { OrderList } from './lists/orderList';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Order, TransactionState } from '../lib/transactions';

export const OrdersForCustomers: React.FC<{orders: Order[]}> = ({ orders }) => {
    const [ordersInPreparation, setOrdersInPreparation] = useState([] as Order[]);

    useEffect(() => {
        console.log(orders);
        setOrdersInPreparation(orders.filter(o => o.transaction.state !== TransactionState.Served));
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
        </Stack>
    );
};