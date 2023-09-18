import {  Box, Button, Card, CardContent,  Chip,  Dialog, DialogActions, DialogTitle, IconButton, Menu, MenuItem, Slide, SlideProps, Snackbar, Stack, Typography } from '@mui/material';
import { Order, TransactionState } from '../../lib/transactions';
import React, { useContext, useState } from 'react';
import { formatMoney } from '../accountDetails';
import { cashInTransaction, useFirestoreUser, useUpdateOrderStatus } from '../../lib/firestoreHooks';
import { getIngredientPrice } from '../../lib/ingredients';
import {Cancel, CheckCircle, EditOutlined, Timelapse} from '@mui/icons-material';
import { ProductWithQty } from '../../lib/products';
import { SnackbarContext } from '../scrollableContainer';
import { useRouter } from 'next/router';

export const OrderItemLine: React.FC<{
    productWithQty: ProductWithQty,
    quantity: number,
    size: string,
    showIngredients?: boolean,
    short?: boolean
}> = ({ productWithQty, quantity, size, showIngredients, short }) => {
    const product = productWithQty.product;
    if (product.type === 'serving') {
        return (
            <>
                <Stack key={product.name} direction="row" justifyContent={'space-between'}>
                    <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                        {quantity} x {product.name}: <strong>{size}</strong>
                    </Typography>
                    {!short && (
                        <Typography variant="body2">{formatMoney(quantity * (product.sizeWithPrices[size] + getIngredientPrice(product.ingredients)))}</Typography>
                    )}
                </Stack>
                {showIngredients && product.ingredients && product.ingredients.map((ingredient) =>
                    <Stack key={ingredient.name} direction="row" justifyContent={'space-between'}>
                        <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>· {ingredient.name}</Typography>
                        {ingredient.price > 0 && <Typography variant="body2">+{formatMoney(ingredient.price)}</Typography>}
                    </Stack>
                )}
            </>
        );
    } else {
        return (
            <Stack key={product.name} direction="row" justifyContent={'space-between'}>
                <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                    {quantity} x {product.name}: <strong>{size}</strong>
                </Typography>
                {!short && (
                    <Typography variant="body2">{formatMoney(quantity * (product.sizeWithPrices[size] +  getIngredientPrice(product.ingredients)))}</Typography>
                )}
            </Stack>
        );
    }
};

const OrderItem: React.FC<{order: Order, short?: boolean}> = ({order, short}) => {
    const user = useFirestoreUser();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const setSnackbarMessage = useContext(SnackbarContext);
    const setOrderStatus = useUpdateOrderStatus();


    const handleOpenMenu = (event: { currentTarget: React.SetStateAction<HTMLElement | null>; }) => {
        if (user?.isAdmin) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleChangeStatus = async (state: number) => {
        handleCloseMenu();
        const {success, message} = await setOrderStatus(order.transaction, state);
        if (success) {
            setSnackbarMessage(message, 'success');
        } else {
            setSnackbarMessage(message, 'error');
        }
        setConfirmDialogOpen(false);
    };

    const setStatusServed = async () => {
        const {success, message} = await cashInTransaction(order.transaction);
        if (success) {
            await setOrderStatus(order.transaction, TransactionState.Served);
            setSnackbarMessage(message, 'success');
        } else {
            console.error('Failed to cash in order');
            setSnackbarMessage(message, 'error');
        }
        setConfirmDialogOpen(false);
    };

    const setStatusCancelled = async () => {
        const {success, message} = await setOrderStatus(order.transaction, TransactionState.Cancelled);
        if (success) {
            setSnackbarMessage(message, 'success');
        } else {
            console.error('Failed to cancel order');
            setSnackbarMessage(message, 'error');
        }
        setCancelDialogOpen(false);
    };

    return (
        <Card variant={order.transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
            width: '100%',
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
                            (quantity > 0 && (
                                <OrderItemLine
                                    key={productWithQty.id}
                                    productWithQty={productWithQty}
                                    quantity={quantity}
                                    size={size}
                                    showIngredients={!short}
                                    short={short}
                                />
                            ))))
                    )}
                </Box>

                <Box display="flex" justifyContent="flex-end" flexDirection={'row'} alignItems={'center'}>
                    {user?.isAdmin && order.transaction.state !== TransactionState.Served && (
                        <>
                            {/* Cancel button */}
                            <IconButton>
                                <Cancel
                                    onClick={() => setCancelDialogOpen(true)}
                                    fontSize='small'
                                    sx={(theme) => ({
                                        color: theme.colors.main,
                                    })} />
                            </IconButton>
                            {/* Edit button */}
                            <IconButton>
                                <EditOutlined
                                    onClick={() => router.push(`/edit/${order.transaction.id}`)}
                                    fontSize='small'
                                    sx={(theme) => ({
                                        color: theme.colors.main,
                                    })} />
                            </IconButton>
                        </>
                    )}

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
                    {'Attention cette action est irréversible. Êtes-vous sûr de vouloir indiquer cette commande comme "Servie" ?'}
                </DialogTitle>

                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={setStatusServed} variant="contained">Confirmer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>
                    {'Attention cette action est irréversible. Êtes-vous sûr de vouloir indiquer cette commande comme "Annulée" ?'}
                </DialogTitle>

                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={setStatusCancelled} variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export const OrderList: React.FC<{orders: Order[], short?: boolean}> = ({orders, short}) => {
    return (
        <Stack direction='column' gap='16px' alignItems={'center'}>
            {orders.map((order) => (
                <OrderItem order={order} key={order.id} short={short} />
            ))}
        </Stack>
    );
};