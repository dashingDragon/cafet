import { AccountBalanceWallet, AccountCircle, AddModerator, Coffee, Cookie, DeleteForever, Edit, Error, Euro, LunchDining, PointOfSale } from '@mui/icons-material';
import { Avatar, Box, Button, ButtonGroup, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Account, MAX_MONEY_PER_ACCOUNT, School } from '../lib/accounts';
import {  useAccountDeleter, useAccountEditor, useCurrentStatsForAccount, useMakeStaff, useRechargeTransactionMaker, useTransactionHistory } from '../lib/firestoreHooks';
import AccountEditDialog from './dialogs/accountEditDialog';
import { TransactionOrder, TransactionRecharge, TransactionState, TransactionType } from '../lib/transactions';
import { useGuardIsAdmin } from '../lib/hooks';
import Image from 'next/image';
import { imageLoader } from '../pages/_app';

const schoolToImage = (school: School) => {
    return `/schools/${School[school].toLowerCase()}.png`;
};

export const formatMoney = (v: number) => (v / 100).toFixed(2) + ' €';
export const formatDate = (date: Date) => {
    if (date instanceof Date) {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }
};

const AccountHeader: React.FC<{ account: Account }> = ({ account }) => {
    return (
        <Card sx={{ borderRadius: '10px' }}>
            <CardContent>
                <Box display="flex">
                    <Avatar
                        alt="School logo"
                        src={schoolToImage(account.school)}
                        sx={{ width: 64, height: 64 }}
                    />
                    <Box display="flex" flexDirection="column" ml={2}>
                        <Typography variant="h5">{account.firstName} {account.lastName.toUpperCase()}</Typography>
                        {account.email !== '' && (
                            <Typography variant="overline" sx={{ textTransform: 'none' }}>{account.email}</Typography>
                        )}
                        {account.phone !== '' && (
                            <Typography variant="overline" sx={{ textTransform: 'none' }}>{account.phone}</Typography>
                        )}
                        <Stack direction="row">
                            {account.isStaff && (
                                <Chip
                                    variant="outlined"
                                    color={'warning'}
                                    icon={<AccountCircle sx={{ marginLeft: 2 }} />}
                                    label={'Staff'}
                                    sx={{
                                        width: '100px',
                                        mr: 2,
                                    }}
                                />
                            )}
                            {account.isLinkedToGoogle && (
                                <Image
                                    loader={imageLoader}
                                    src={'../png/google.png'}
                                    alt={'Vege'}
                                    height={32}
                                    width={32}
                                    className={'icon'}
                                />
                            )}
                        </Stack>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const AccountBalanceAndRecharge: React.FC<{ account: Account }> = ({ account }) => {
    const admin = useGuardIsAdmin();
    const recharge = useRechargeTransactionMaker();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState(null as number | null);

    const maxRecharge = MAX_MONEY_PER_ACCOUNT - account.balance;

    const handleDialogClose = () => {
        setRechargeAmount(null);
        setDialogOpen(false);
    };

    const handleRecharge = async () => {
        setDialogOpen(false);
        await recharge(account, (rechargeAmount ?? 0) * 100);
        setRechargeAmount(null);
    };

    return (
        <>
            <Button
                onClick={() => setDialogOpen(true)}
                variant="contained"
                size="large"
                fullWidth
                color={account.balance <= 0 ? 'error' : undefined}
                sx={{ textTransform: 'none', borderRadius: '10px' }}
            >
                <Box
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                >
                    <Box display="flex" alignItems="center" >
                        {account.balance > 0
                            ? <AccountBalanceWallet fontSize="large" sx={{ mr: 1 }} />
                            : <Error fontSize="large" sx={{ mr: 1 }} />
                        }
                        <Typography variant="h4">{formatMoney(account.balance)}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'hsla(220, 27%, 98%, 1)' }}>Cliquez pour recharger</Typography>
                </Box>
            </Button>

            {/* Dialog for recharge */}
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Recharger le compte</DialogTitle>
                <DialogContent>
                    <TextField
                        value={rechargeAmount ?? ''}
                        onChange={(e) => setRechargeAmount(e.target.value.length == 0 ? null : Math.min(+e.target.value, maxRecharge / 100))}
                        type="number"
                        autoFocus
                        placeholder="Montant (€)"
                        variant="standard"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={handleRecharge} variant="contained">Ok</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const AccountActions: React.FC<{ account: Account }> = ({ account }) => {
    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [staffDialogOpen, setStaffDialogOpen] = useState(false);
    const [deleteConfirm1Open, setDeleteConfirm1Open] = useState(false);
    const [deleteConfirm2Open, setDeleteConfirm2Open] = useState(false);

    const router = useRouter();
    const admin = useGuardIsAdmin();
    const accountEditor = useAccountEditor();
    const accountDeleter = useAccountDeleter();
    const makeStaff = useMakeStaff();

    const handleAccountEdit = async (firstName: string, lastName: string, school: School, phone: string, email: string) => {
        try {
            setEditDialogOpen(false);
            await accountEditor(account,firstName, lastName, school, phone, email);
        } catch (e: any) {
            alert(`Failed to edit account: ${e}`);
        }
    };

    const handleMakeStaff = async (isStaff: boolean) => {
        setStaffDialogOpen(false);
        if (isStaff != account.isStaff) {
            await makeStaff(account, isStaff);
        }
    };

    const handleAccountDelete = async () => {
        try {
            setDeleteConfirm1Open(false);
            setDeleteConfirm2Open(false);
            await accountDeleter(account);
            router.replace('/');
        } catch (e: any) {
            alert(`Failed to delete account: ${e}`);
        }
    };

    const buttons = [
        {
            icon: <PointOfSale sx={{ color: 'hsla(220, 27%, 98%, 1)'}} />,
            color: 'primary',
            text: 'Encaisser',
            enabled: () => account.balance > 0,
            onClick: () => router.push(`/accounts/${account.id}/pay`),
        },
        {
            icon: <Edit sx={{ color: 'hsla(220, 27%, 98%, 1)'}} />,
            color: 'primary',
            text: 'Editer',
            enabled: () => true,
            onClick: () => setEditDialogOpen(true),
        },
        {
            icon: <AddModerator sx={{ color: 'hsla(220, 27%, 98%, 1)'}} />,
            color: 'primary',
            text: 'Staff',
            enabled: () => true,
            onClick: () => setStaffDialogOpen(true),
        },
        {
            icon: <DeleteForever sx={{ color: 'hsla(220, 27%, 98%, 1)'}} />,
            color: 'error',
            text: 'Supprimer',
            enabled: () => true,
            onClick: () => setDeleteConfirm1Open(true),
        },
    ] as const;

    return (
        <>
            <Box width="100%">
                <ButtonGroup variant="contained" fullWidth sx={{ borderRadius: '10px', overflow: 'hidden'}}>

                    {buttons.map(({ icon, color, text, enabled, onClick }, i) =>
                        <Button
                            key={i}
                            onClick={onClick}
                            disabled={!enabled()}
                            color={color}
                            sx={{ textTransform: 'none' }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="center">
                                {icon}
                                <Typography variant="body2" sx={{ color: 'hsla(220, 27%, 98%, 1)' }}>{text}</Typography>
                            </Box>
                        </Button>
                    )}

                </ButtonGroup>
            </Box>

            {/* Edit dialog */}
            <AccountEditDialog
                account={account}
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSubmit={handleAccountEdit}
            />

            {/* Staff dialog */}
            <Dialog open={staffDialogOpen} onClose={() => setStaffDialogOpen(false)}>
                <DialogTitle>Cette personne est-elle un staff ?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => handleMakeStaff(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={() => handleMakeStaff(true)} variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm 1 */}
            <Dialog open={deleteConfirm1Open} onClose={() => setDeleteConfirm1Open(false)}>
                <DialogTitle>Attention cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce compte ?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm1Open(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={() => { setDeleteConfirm1Open(false); setDeleteConfirm2Open(true); }} variant="contained">Supprimer</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm 2 */}
            <Dialog open={deleteConfirm2Open} onClose={() => setDeleteConfirm2Open(false)}>
                <DialogTitle>Le compte sera supprimé pour toujours de la base de données. Continuer ?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm2Open(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={handleAccountDelete} variant="contained">Supprimer</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const AccountStats: React.FC<{ account: Account }> = ({ account }) => {
    const {totalMoneySpent, servingsOrdered, drinksOrdered, snacksOrdered} = useCurrentStatsForAccount(account);

    const rows = [
        [
            {
                icon: <LunchDining />,
                value: servingsOrdered,
                text: 'Plats commandés',
            },
            {
                icon: <Coffee />,
                value: drinksOrdered,
                text: 'Boissons commandées',
            },
            {
                icon: <Cookie />,
                value: snacksOrdered,
                text: 'Snacks commandés',
            },
        ],
        [
            {
                icon: <Euro />,
                value: formatMoney(totalMoneySpent),
                text: 'Total dépensé',
            },
        ],
    ] as const;

    return (
        <Card sx={{ borderRadius: '10px' }}>
            <CardContent>
                <Typography variant="h5" sx={{ pb: 2 }}>Statistiques</Typography>
                {/* For each row */}
                {rows.map((row, i) =>
                    <React.Fragment key={i}>
                        <Box display="flex" justifyContent="space-around" flexDirection={'column'}>
                            {/* For each stat in the row */}
                            {row.map(({ icon, value, text }, i) =>
                                <Box key={i} display="flex" flexDirection="row" alignItems="center" justifyContent={'space-between'} py={1}>
                                    <Box display="flex" alignItems="center">
                                        {icon}
                                        <Typography variant="h5">&nbsp;{value}</Typography>
                                    </Box>
                                    <Typography variant="body1">{text}</Typography>
                                </Box>
                            )}
                        </Box>
                        <Divider />
                    </React.Fragment>
                )}
            </CardContent>
        </Card>
    );
};

const AccountHistory: React.FC<{ account: Account }> = ({ account }) => {
    const transactions = useTransactionHistory(account);

    return (
        <Card sx={{ mb: 4, borderRadius: '10px' }}>
            <CardContent sx={{ pb: 0 }}>
                <Typography variant="h5" sx={{ pb: 4 }}>Historique</Typography>
                {transactions.sort((a, b) => +b.createdAt - +a.createdAt).map((transaction, i) => {
                    if (transaction.type === TransactionType.Recharge) {
                        return (
                            <div key={i}>
                                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={1}>
                                    <Typography variant="body1">
                                        Recharge
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme => (transaction as TransactionRecharge).amount > 0 ? theme.palette.success.main : theme.palette.error.main }}>
                                        {`${(transaction as TransactionRecharge).amount > 0 ? '+' : ''}${formatMoney((transaction as TransactionRecharge).amount)}`}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={3}>
                                    <Typography variant="body1">
                                        {formatDate(transaction.createdAt.toDate())}
                                    </Typography>
                                    {transaction.admin?.firstName ? (
                                        <Typography variant="body1" sx={{ fontStyle: 'italic'}}>
                                            Rechargé par {transaction.admin.firstName}
                                        </Typography>
                                    ) : null
                                    }
                                </Box>
                            </div>
                        );
                    } else if (transaction.type === TransactionType.Order) {
                        return (
                            <div key={i}>
                                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={1}>
                                    <Typography variant="body1">
                                        Commande
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        fontWeight: 'bold',
                                        textDecorationLine: (transaction as TransactionOrder).state === TransactionState.Cancelled ? 'line-through' : 'none',
                                        color: theme => theme.palette.error.main,
                                    }}>
                                        -{formatMoney((transaction as TransactionOrder).price)}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" flexDirection={'row'} mb={3}>
                                    {(transaction as TransactionOrder).state === TransactionState.Cancelled ? (
                                        <>
                                            <Typography variant="body1">
                                                {formatDate(transaction.createdAt.toDate())}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                                Commande annulée
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body1">
                                                {formatDate(transaction.createdAt.toDate())}
                                            </Typography>
                                            {transaction.admin?.firstName ? (
                                                <Typography variant="body1" sx={{ fontStyle: 'italic'}}>
                                                    Encaissée par {transaction.admin.firstName}
                                                </Typography>
                                            ) : null
                                            }
                                        </>
                                    )}
                                    
                                </Box>
                            </div>
                        );
                    }
                })}
                {transactions.length === 0 && (
                    <Typography>
                        Cet utilisateur n&apos;a jamais effectué de transaction.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const AccountDetails: React.FC<{ account: Account }> = (props) => {
    const { account } = props;
    const linesParams = { mb: 2 };

    const router = useRouter();

    useEffect(() => {
    // If we are here we are proably going to be heading there
        router.prefetch(`/accounts/${account.id}/pay`);
    });

    return (
        <>
            <Box {...linesParams}>
                <AccountHeader {...props} />
            </Box>
            <Box {...linesParams}>
                <AccountBalanceAndRecharge {...props} />
            </Box>
            <Box {...linesParams}>
                <AccountActions {...props} />
            </Box>
            <Box {...linesParams}>
                <AccountStats {...props} />
            </Box>
            <Box {...linesParams}>
                <AccountHistory {...props} />
            </Box>
        </>
    );
};

export default AccountDetails;
