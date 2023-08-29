import { Avatar, Box, Card, CardContent, Chip, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { CheckCircle, DarkMode, LightMode, Logout, Timelapse } from '@mui/icons-material';
import ProductMenu from './productMenu';
import { invertTheme, useAppTheme } from '../lib/theme';
import { useOrderHistory } from '../lib/firebaseFunctionHooks';
import { TransactionOrder, TransactionState } from '../lib/transactions';
import { formatDate, formatMoney } from './accountDetails';
import { OrderItemLine } from './lists/orderList';

const getDateFromBrokenTimestamp = (date: { _seconds: number }): Date => {
    return new Date(date._seconds * 1000);
};

export const CustomerView: React.FC<{
    account: Account,
}> = ({ account }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [theme, setTheme] = useAppTheme();
    const getOrderHistory = useOrderHistory();
    const [orderHistory, setOrderHistory] = useState<TransactionOrder[] | undefined>();
    const [currentOrders, setCurrentOrders] = useState<TransactionOrder[]>([]);
    const [pastOrders, setPastOrders] = useState<TransactionOrder[]>([]);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeTheme = () => {
        setTheme(invertTheme(theme!));
        handleClose();
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    useEffect(() => {
        const updateOrderHistory = async () => {
            const result = await getOrderHistory();

            if (result.data.success && result.data.orders) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const sortedOrders = result.data.orders.sort(
                    (a, b) => +getDateFromBrokenTimestamp(b.createdAt as unknown as {_seconds: number})
                    - +getDateFromBrokenTimestamp(a.createdAt as unknown as {_seconds: number}));
                setCurrentOrders(sortedOrders.filter(transaction => {
                    const transactionDate = getDateFromBrokenTimestamp(transaction.createdAt as unknown as {_seconds: number});
                    transactionDate.setHours(0, 0, 0, 0);
                    return transactionDate.getTime() === today.getTime() && transaction.state !== TransactionState.Served;
                }));
                setPastOrders(sortedOrders.filter(transaction => {
                    const transactionDate = getDateFromBrokenTimestamp(transaction.createdAt as unknown as {_seconds: number});
                    transactionDate.setHours(0, 0, 0, 0);
                    return !(transactionDate.getTime() === today.getTime() && transaction.state !== TransactionState.Served);
                }));
            }
        };
        updateOrderHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack
            flexGrow={1}
            direction="column"
            pb={4}
            maxHeight='100%'
            width='100%'
        >
            <Stack sx={{
                p: 2,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <Typography variant="h6">
                    Bonjour <strong>{account.firstName}</strong> !
                </Typography>

                <IconButton onClick={handleClick}>
                    <Avatar
                        src={user?.photoURL ?? ''}
                        sx={{
                            mr: 1,
                            background: 'default',
                            fontSize: '12px',
                            color: 'white',
                        }}
                    >
                        <Typography variant="body1">
                            {[account.firstName[0].toUpperCase(), account.lastName[0].toUpperCase()].join('')}
                        </Typography>
                    </Avatar>
                </IconButton>
            </Stack>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleChangeTheme}>
                    <ListItemIcon>
                        {theme === 'dark' ? (
                            <LightMode fontSize="small" />
                        ) : (
                            <DarkMode fontSize="small" />
                        )}
                    </ListItemIcon>
                    Thème
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Déconnexion
                </MenuItem>
            </Menu>

            {currentOrders.length ? (
                <>
                    <Typography variant="body1" px={2} mb={2}>
                        {'Aujourd\'hui'}
                    </Typography>
                    <Stack direction='column' alignItems={'center'} gap={2} mb={4}>
                        {currentOrders.map((transaction, i) => (
                            <Card key={i} variant={transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
                                width: '320px',
                                position: 'relative',
                                borderRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <CardContent>
                                    <Chip
                                        variant="outlined"
                                        color={transaction.state === TransactionState.Preparing ? 'warning' : 'success'}
                                        icon={transaction.state === TransactionState.Preparing ? (
                                            <Timelapse sx={{ marginLeft: 2 }} color="warning" />
                                        ) : (
                                            <CheckCircle sx={{ marginLeft: 2 }} color="success" />
                                        )}
                                        label={transaction.state === TransactionState.Preparing
                                            ? 'En préparation'
                                            : transaction.state === TransactionState.Ready
                                                ? 'Prête' : 'Servie'
                                        }
                                        disabled={transaction.state === TransactionState.Served}
                                        sx={{
                                            marginBottom: 2,
                                        }}
                                    />

                                    <Box mb={2}>
                                        {transaction.productsWithQty.map((productWithQty) => (
                                            Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                                                (quantity > 0 && <OrderItemLine key={productWithQty.id + size} productWithQty={productWithQty} quantity={quantity} size={size} /> ))))
                                        }
                                        <Stack key={'total'} direction="row" justifyContent={'space-between'}>
                                            <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}><strong>Total</strong></Typography>
                                            <Typography variant="body2"><strong>{formatMoney(transaction.price)}</strong></Typography>
                                        </Stack>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" flexDirection={'row'}>
                                        <Typography variant="body1">
                                            {formatDate(getDateFromBrokenTimestamp(transaction.createdAt as unknown as {_seconds: number}))}
                                        </Typography>
                                        {transaction.admin?.firstName ? (
                                            <Typography variant="body1" sx={{ fontStyle: 'italic'}}>
                                        Passée par {transaction.admin.firstName}
                                            </Typography>
                                        ) : null
                                        }
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </>
            ) : (
                <>
                    <Typography variant="body1" px={2}>
                        {'Que voulez-vous manger aujourd\'hui ?'}
                    </Typography>

                    <ProductMenu account={account} />
                </>
            )}

            {pastOrders.length > 0 && (
                <>
                    <Typography variant="body1" px={2} mb={2}>
                        {'Commandes passées'}
                    </Typography>
                    <Stack direction='column' alignItems={'center'} gap={2}>
                        {pastOrders.map((transaction, i) => (
                            <Card key={i} variant={transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
                                width: '320px',
                                position: 'relative',
                                borderRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <CardContent>
                                    <Chip
                                        variant="outlined"
                                        color={transaction.state === TransactionState.Preparing ? 'warning' : 'success'}
                                        icon={transaction.state === TransactionState.Preparing ? (
                                            <Timelapse sx={{ marginLeft: 2 }} color="warning" />
                                        ) : (
                                            <CheckCircle sx={{ marginLeft: 2 }} color="success" />
                                        )}
                                        label={transaction.state === TransactionState.Preparing
                                            ? 'En préparation'
                                            : transaction.state === TransactionState.Ready
                                                ? 'Prête' : 'Servie'
                                        }
                                        disabled={transaction.state === TransactionState.Served}
                                        sx={{
                                            marginBottom: 2,
                                        }}
                                    />

                                    <Box mb={2}>
                                        {transaction.productsWithQty.map((productWithQty) => (
                                            Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                                                (quantity > 0 && <OrderItemLine key={productWithQty.id + size} productWithQty={productWithQty} quantity={quantity} size={size} /> ))))
                                        }
                                        <Stack key={'total'} direction="row" justifyContent={'space-between'}>
                                            <Typography variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}><strong>Total</strong></Typography>
                                            <Typography variant="body2"><strong>{formatMoney(transaction.price)}</strong></Typography>
                                        </Stack>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" flexDirection={'row'}>
                                        <Typography variant="body1">
                                            {formatDate(getDateFromBrokenTimestamp(transaction.createdAt as unknown as {_seconds: number}))}
                                        </Typography>
                                        {transaction.admin?.firstName ? (
                                            <Typography variant="body1" sx={{ fontStyle: 'italic'}}>
                                        Passée par {transaction.admin.firstName}
                                            </Typography>
                                        ) : null
                                        }
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </>
            )}
        </Stack>
    );
};