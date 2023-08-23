import { Alert, AlertColor, Box, Button, Card, CardContent,  Chip,  Dialog, DialogActions, DialogTitle, Menu, MenuItem, Slide, SlideProps, Snackbar, Stack, Typography } from '@mui/material';
import { Order, TransactionState } from '../lib/transactions';
import React, { useState } from 'react';
import { formatMoney } from './accountDetails';
import { cashInTransaction, useStaffUser, useUpdateOrderStatus } from '../lib/firestoreHooks';
import {CheckCircle, Timelapse} from '@mui/icons-material';
import { ProductWithQty } from '../lib/products';
import { getIngredientPrice } from '../lib/ingredients';

export const OrderItemLine: React.FC<{
    productWithQty: ProductWithQty,
    quantity: number,
    size: string,
    showIngredients?: boolean,
    short?: boolean
}> = ({ productWithQty, quantity, size, showIngredients, short }) => {
    if (productWithQty.product.type === 'serving') {
        return (
            <>
                <Stack key={productWithQty.product.name} direction="row" justifyContent={'space-between'}>
                    <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                        {quantity} x {productWithQty.product.name}: <strong>{size}</strong>
                    </Typography>
                    {!short && (
                        <Typography variant="body2">{formatMoney(quantity * (productWithQty.product.sizeWithPrices[size] +  getIngredientPrice(productWithQty.product.ingredients)))}</Typography>
                    )}
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
                    {quantity} x {productWithQty.product.name}: <strong>{size}</strong>
                </Typography>
                {!short && (
                    <Typography variant="body2">{formatMoney(quantity * (productWithQty.product.sizeWithPrices[size] +  getIngredientPrice(productWithQty.product.ingredients)))}</Typography>
                )}
            </Stack>
        );
    }
};

const OrderItem: React.FC<{order: Order, setSnackbarMessage: (message: string, severity: AlertColor) => void, short?: boolean}> = ({order, setSnackbarMessage, short}) => {
    const setOrderStatus = useUpdateOrderStatus();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const staff = useStaffUser();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleOpenMenu = (event: { currentTarget: React.SetStateAction<HTMLElement | null>; }) => {
        if (staff?.isAdmin) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleChangeStatus = async (state: number) => {
        handleCloseMenu();
        await setOrderStatus(order.transaction, state);
    };

    const setStatusDelivered = async () => {
        const {success, message} = await cashInTransaction(order.transaction);
        if (success) {
            await setOrderStatus(order.transaction, TransactionState.Served);
            setSnackbarMessage(message, 'success');
        } else {
            console.error('Failed to cash in transaction');
            setSnackbarMessage(message, 'error');
        }
        setConfirmDialogOpen(false);
    };

    return (
        <Card variant={order.transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
            width: 350,
            minWidth: 350,
            position: 'relative',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={2}>
                    <Typography variant="body1">
                        <strong>N°{order.id}</strong> - Pour {order.transaction.customer.firstName} {order.transaction.customer.lastName}
                    </Typography>
                    {!short && (
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {formatMoney(order.transaction.price)}
                        </Typography>
                    )}
                </Box>

                <Box mb={2}>
                    {order.transaction.productsWithQty.map((productWithQty) => (
                        Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                            (quantity > 0 && <OrderItemLine productWithQty={productWithQty} quantity={quantity} size={size} showIngredients={!short} short={short} /> ))))
                    }
                </Box>

                <Box display="flex" justifyContent="flex-end" flexDirection={'row'}>
                    <Chip
                        variant="outlined"
                        color={order.transaction.state === TransactionState.Preparing ? 'warning' : 'success'}
                        icon={order.transaction.state === TransactionState.Preparing ? (
                            <Timelapse sx={{ marginLeft: 2 }} color="warning" />
                        ) : (
                            <CheckCircle sx={{ marginLeft: 2 }} color="success" />
                        )}
                        label={order.transaction.state === TransactionState.Preparing
                            ? 'En préparation'
                            : order.transaction.state === TransactionState.Ready
                                ? 'Prête' : 'Servie'
                        }
                        onClick={handleOpenMenu}
                        disabled={order.transaction.state === TransactionState.Served}
                    />
                </Box>
            </CardContent>

            <Menu
                id="add-size-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={() => handleChangeStatus(TransactionState.Preparing)} disabled={order.transaction.state === TransactionState.Preparing}>
                    En préparation
                </MenuItem>
                <MenuItem onClick={() => handleChangeStatus(TransactionState.Ready)} disabled={order.transaction.state === TransactionState.Ready}>
                    Prête
                </MenuItem>
                <MenuItem onClick={() => setConfirmDialogOpen(true)} disabled={order.transaction.state === TransactionState.Served}>
                    Servie
                </MenuItem>
            </Menu>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>
                    {'Attention cette action est irréversible. Êtes-vous sûr de vouloir indiquer cette commande comme "livrée" ?'}
                </DialogTitle>

                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={setStatusDelivered} variant="contained">Confirmer</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

type TransitionProps = Omit<SlideProps, 'direction'>;

const TransitionRight = (props: TransitionProps) => {
    return <Slide {...props} direction="right" />;
};

export const OrderList: React.FC<{orders: Order[], short?: boolean}> = ({orders, short}) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');

    const setSnackbarMessage = (message: string, severity: AlertColor) => {
        setMessage(message);
        setSeverity(severity);
        setSnackbarOpen(true);
    };

    return (
        <Stack direction='column' gap='16px' alignItems={'center'}>
            {orders.map((order) => (
                <OrderItem order={order} setSnackbarMessage={setSnackbarMessage} key={order.id} short={short} />
            ))}
            <Snackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                TransitionComponent={TransitionRight}
                key={'transition'}
                autoHideDuration={6000}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};