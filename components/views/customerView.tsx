import { Alert, AlertTitle, Avatar, Box, Card, CardContent, Chip, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { Account } from '../../lib/accounts';
import { CheckCircle, DarkMode, LightMode, Logout, Timelapse } from '@mui/icons-material';
import ProductMenu from '../productMenu';
import { invertTheme, useAppTheme } from '../../lib/theme';
import { useOrderHistory, useQueuePosition } from '../../lib/firebaseFunctionHooks';
import { TransactionOrder, TransactionState } from '../../lib/transactions';
import { formatDate, formatMoney } from '../accountDetails';
import { OrderItemLine } from '../lists/orderList';
import Image from 'next/image';
import { imageLoader } from '../../pages/_app';
import { DateTime } from 'luxon';
import { SnackbarContext } from '../layout/scrollableContainer';

const getDateFromBrokenTimestamp = (date: { _seconds: number }): Date => {
    return new Date(date._seconds * 1000);
};

const isCurrentTimeInRange = () => {
    const parisTimeZone = 'Europe/Paris';
    const currentTimeParis = DateTime.now().setZone(parisTimeZone);
    const startOfOrderPeriod = currentTimeParis.set({hour: 22, minute: 0, second: 0, millisecond: 1});
    const endOfOrderPeriod = currentTimeParis.set({hour: 11, minute: 30, second: 0, millisecond: 0});

    if (currentTimeParis.weekday === 6 /* saturday */) {
        return false;
    } else if (currentTimeParis.weekday === 5 /* friday */) {
        if (currentTimeParis <= endOfOrderPeriod) {
            return true;
        }    
    } else if (currentTimeParis.weekday === 7 /* sunday */) {
        if (currentTimeParis >= startOfOrderPeriod) {
            return true;
        }
    } else {
        if (currentTimeParis <= endOfOrderPeriod || currentTimeParis >= startOfOrderPeriod) {
            return true;
        }
    }
    return false;   
};

export const CustomerView: React.FC<{
    account: Account,
}> = ({ account }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [theme, setTheme] = useAppTheme();
    const getOrderHistory = useOrderHistory();
    const [currentOrders, setCurrentOrders] = useState<TransactionOrder[]>([]);
    const [pastOrders, setPastOrders] = useState<TransactionOrder[]>([]);
    const isTimeToOrder = isCurrentTimeInRange();
    const getQueuePosition = useQueuePosition();
    const [queuePosition, setQueuePosition] = useState(0);
    const setSnackbarMessage = useContext(SnackbarContext);

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

        const updateQueuePosition = async () => {
            const result = await getQueuePosition();
            if (result.data.success) {
                setQueuePosition(result.data.position);
            } else {
                setSnackbarMessage('Error fetching queue position', 'error');
            }

        };
        updateQueuePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* Header Banner */}
            <Stack sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <Typography variant="h6">
                        Bonjour <strong>{account.firstName}</strong> !
                </Typography>

                <IconButton onClick={handleClick} sx={{ padding: 0 }}>
                    <Avatar
                        src={user?.photoURL ?? ''}
                        sx={{
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
                    <MenuItem disableRipple disableTouchRipple>
                            Mon compte: <strong>{formatMoney(account.balance)}</strong>
                    </MenuItem>
                    <Divider />
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
            </Stack>

            {/* Announcement banner */}
            <Box sx={{
                my: 4,
                width: '100%',
                height: '128px',
                background: 'linear-gradient(135deg, rgba(253,29,29,1) 0%, rgba(252,176,69,1) 100%)',
                backgroundImage: 'url("/svg/orange_circles.svg")',
                backgroundSize: 'cover',
                borderRadius: '20px',
                boxShadow: 'inset 0 2px 4px 0 hsla(0, 0%, 0%, .2)',
                position: 'relative',
                flexShrink: 0,
            }}>
                <Typography sx={{
                    fontWeight: 700,
                    fontSize: '20px',
                    position: 'absolute',
                    left: '15px',
                    bottom: '10px',
                    color: '#fff',
                    maxWidth: '150px',
                }}>
                    {'L\'appli Cafet est sortie !'}
                </Typography>
                <Box sx={{
                    position: 'absolute',
                    right: '20px',
                    bottom: '0',
                }}>
                    <Image
                        loader={imageLoader}
                        src={'svg/party.svg'}
                        alt={''}
                        height={128}
                        width={128}
                        className={'icon'}
                    />
                </Box>
            </Box>

            {/* Error Banner */}
            {account.balance < 200 && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: '20px', mb: 4 }}>
                    <AlertTitle sx={{ color: '#fff', fontWeight: 700 }}>Compte à sec</AlertTitle>
                    Votre compte est vide ou presque, allez-le <strong>recharger</strong> auprès d&apos;un Cafet Master.
                </Alert>
            )}

            {/* Today's orders */}
            {currentOrders.length ? (
                <>
                    <Typography variant="body1" mb={2} mt={4}>
                        {'Aujourd\'hui'}
                    </Typography>
                    {queuePosition > 0 && (
                        <Typography variant="body2" mb={2} mt={4}>
                            {'Position dans la file d\'attente : '}
                            <strong>
                                {queuePosition}
                            </strong>
                        </Typography>
                    )}
                    <Stack direction='column' alignItems={'center'} gap={2} mb={4}>
                        {currentOrders.map((transaction, i) => (
                            <Card key={i} variant={transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
                                width: '100%',
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
                                                Encaissée par {transaction.admin.firstName}
                                            </Typography>
                                        ) : null
                                        }
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </>
            ) : !isTimeToOrder ? (
                <>
                    <Alert severity="error" variant="filled" sx={{ borderRadius: '20px', mb: 8 }}>
                        <AlertTitle sx={{ color: '#fff', fontWeight: 700 }}>Bientôt...</AlertTitle>
                        Ce n&apos;est pas encore l&apos;heure de commander.
                        Vous pouvez commander de <strong>22h</strong> à <strong>11h30</strong> du <strong>dimanche</strong> au <strong>vendredi</strong>.
                    </Alert>
                    <Image
                        loader={imageLoader}
                        src={'/svg/waiting.svg'}
                        alt={'Success image'}
                        width={120}
                        height={120}
                    />
                </>
            ) : (
                <>
                    <Typography variant="body1" mt={8}>
                        {'Que voulez-vous manger aujourd\'hui ?'}
                    </Typography>

                    <ProductMenu account={account} />
                </>
            )}

            {/* Past orders */}
            {pastOrders.length > 0 && (
                <>
                    <Typography variant="body1" mb={2} mt={4}>
                        {'Commandes passées'}
                    </Typography>
                    <Stack direction='column' alignItems={'center'} gap={2}>
                        {pastOrders.map((transaction, i) => (
                            <Card key={i} variant={transaction.state !== TransactionState.Preparing ? 'outlined' : 'elevation'} sx={{
                                width: '100%',
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
                                                Encaissée par {transaction.admin.firstName}
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
        </>
    );
};