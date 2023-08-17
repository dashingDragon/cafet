import { Box, Button, Card, CardContent,  Chip,  Dialog, DialogActions, DialogTitle, Stack, Typography } from '@mui/material';
import { Transaction, TransactionOrder } from '../lib/transactions';
import React, { useState } from 'react';
import { formatDate, formatMoney } from './accountDetails';
import { useUpdateOrderStatus } from '../lib/firestoreHooks';
import {CheckCircle, Timelapse} from '@mui/icons-material';
import { ProductWithQty } from '../lib/products';

export const OrderItemLine: React.FC<{productWithQty: ProductWithQty, quantity: number, size: string, showIngredients?: boolean}> = ({ productWithQty, quantity, size, showIngredients }) => {
    if (productWithQty.product.type === 'serving') {
        return (
            <>
                <Stack key={productWithQty.product.name} direction="row" justifyContent={'space-between'}>
                    <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                        {quantity} x {productWithQty.product.name}: <strong>{size}</strong>
                    </Typography>
                    <Typography variant="body2">{formatMoney(quantity * productWithQty.product.sizeWithPrices[size])}</Typography>
                </Stack>
                {showIngredients && productWithQty.product.ingredients && productWithQty.product.ingredients.map((ingredient) =>
                    <Stack key={ingredient.name} direction="row" justifyContent={'space-between'} pl={'8px'}>
                        <Typography variant="body1">· {ingredient.name}</Typography>
                        {ingredient.price > 0 && <Typography variant="body2">+{formatMoney(ingredient.price)}</Typography>}
                    </Stack>
                )}
            </>
        );
    } else {
        return (
            <Stack key={productWithQty.product.name} direction="row" justifyContent={'space-between'}>
                <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                    {quantity} x {productWithQty.product.name}: {size}
                </Typography>
                <Typography variant="body2">{formatMoney(quantity * productWithQty.product.sizeWithPrices[size])}</Typography>
            </Stack>
        );
    }
};

const OrderItem: React.FC<{order: Transaction, number: number}> = ({order, number}) => {
    const setOrderStatus = useUpdateOrderStatus();
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);

    const handleChangeStatus = async (isReady: boolean) => {
        setStatusDialogOpen(false);
        await setOrderStatus(order as TransactionOrder, isReady);
    };

    return (
        <Card sx={{ marginBottom: 2, marginRight: 1, marginLeft: 1 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={2}>
                    <Typography variant="body1">
                        <strong>N°{number}</strong> - Pour {order.customer.firstName} {order.customer.lastName}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatMoney((order as TransactionOrder).price)}
                    </Typography>
                </Box>

                <Box mb={2}>
                    {(order as TransactionOrder).productsWithQty.map((productWithQty) => (
                        Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                            (quantity > 0 && <OrderItemLine productWithQty={productWithQty} quantity={quantity} size={size} showIngredients /> ))))
                    }
                </Box>

                <Box display="flex" justifyContent="flex-end" flexDirection={'row'}>
                    <Chip
                        variant="outlined"
                        color={(order as TransactionOrder).isReady ? 'success' : 'warning'}
                        icon={(order as TransactionOrder).isReady ? (
                            <CheckCircle sx={{ marginLeft: 2 }} color="success" />
                        ) : (
                            <Timelapse sx={{ marginLeft: 2 }} color="warning" />
                        )}
                        label={(order as TransactionOrder).isReady ? 'Prête' : 'En préparation'}
                        onClick={() => setStatusDialogOpen(true)}
                    />
                </Box>
            </CardContent>

            {/* Change availability dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>
                    La commande est-elle prête ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => handleChangeStatus(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={() => handleChangeStatus(true)} variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>

        </Card>
    );
};

export const OrderList: React.FC<{orders: Transaction[]}> = ({orders}) => {
    return (
        <Box m='1'>
            {orders.sort((a, b) => +a.createdAt - +b.createdAt).map((order, i) => (
                <OrderItem order={order} key={order.id} number={i + 1} />
            ))}
        </Box>
    );
};