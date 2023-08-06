import { AccountBalanceWallet, Error, Close, SportsBar, Edit, DeleteForever, LocalBar, LocalBarOutlined, Savings, SavingsOutlined, PointOfSale, Euro, LunchDining, Coffee, Cookie } from "@mui/icons-material";
import { Avatar, Box, Button, ButtonGroup, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Account, MAX_MONEY_PER_ACCOUNT, School } from "../lib/accounts";
import { useAccountMaker, useAccountDeleter, useRechargeTransactionMaker, useStaffUser, useAccountEditor, useCurrentStatsForAccount } from "../lib/firestoreHooks";
import AccountEditDialog from "./accountEditDialog";

const schoolToImage = (school: School) => {
  return `/schools/${School[school].toLowerCase()}.png`;
};

const formatQuantity = (v: number) => (v / 4).toFixed(2) + " L";
export const formatMoney = (v: number) => (v / 100).toFixed(2) + " €";

const AccountHeader: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex">
          <Avatar
            alt="School logo"
            src={schoolToImage(account.school)}
            sx={{ width: 64, height: 64 }}
          />
          <Box display="flex" flexDirection="column" ml={2}>
            <Typography variant="h5">{account.firstName} {account.lastName.toUpperCase()}</Typography>
            <Typography variant="overline" sx={{ textTransform: "none" }}>{account.id}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AccountBalanceAndRecharge: React.FC<{ account: Account }> = ({ account }) => {
  const staff = useStaffUser();
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
        disabled={!((staff?.isAvailable ?? false) || (staff?.isAdmin ?? false))}
        variant="contained"
        size="large"
        fullWidth
        color={account.balance <= 0 ? "error" : undefined}
        sx={{ textTransform: "none" }}
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
          <Typography variant="body2">Cliquez pour recharger</Typography>
        </Box>
      </Button>

      {/* Dialog for recharge */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Recharger le compte</DialogTitle>
        <DialogContent>
          <TextField
            value={rechargeAmount ?? ""}
            onChange={(e) => setRechargeAmount(e.target.value.length == 0 ? null : Math.min(+e.target.value, maxRecharge / 100))}
            type="number"
            autoFocus
            placeholder="Montant (€)"
            variant="standard"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Annuler</Button>
          <Button onClick={handleRecharge}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountActions: React.FC<{ account: Account }> = ({ account }) => {
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm1Open, setDeleteConfirm1Open] = useState(false);
  const [deleteConfirm2Open, setDeleteConfirm2Open] = useState(false);

  const router = useRouter();
  const staff = useStaffUser();
  const accountEditor = useAccountEditor();
  const accountDeleter = useAccountDeleter();

  const handleAccountEdit = async (firstName: string, lastName: string, school: School) => {
    try {
      setEditDialogOpen(false);
      await accountEditor(account,firstName, lastName, school);
    } catch (e: any) {
      alert(`Failed to edit account: ${e}`);
    }
  };

  const handleAccountDelete = async () => {
    try {
      setDeleteConfirm1Open(false);
      setDeleteConfirm2Open(false);
      await accountDeleter(account);
      router.replace("/");
    } catch (e: any) {
      alert(`Failed to delete account: ${e}`);
    }
  };

  const buttons = [
    {
      icon: <PointOfSale fontSize="large" />,
      color: "primary",
      text: "Encaisser",
      enabled: () => ((staff?.isAvailable ?? false) || (staff?.isAdmin ?? false)) && account.balance > 0,
      onClick: () => router.push(`/accounts/${account.id}/pay`),
    },
    {
      icon: <Edit fontSize="large" />,
      color: "primary",
      text: "Editer",
      enabled: () => (staff?.isAvailable ?? false) || (staff?.isAdmin ?? false),
      onClick: () => setEditDialogOpen(true),
    },
    {
      icon: <DeleteForever fontSize="large" />,
      color: "error",
      text: "Supprimer",
      enabled: () => staff?.isAdmin ?? false,
      onClick: () => setDeleteConfirm1Open(true),
    },
  ] as const;

  return (
    <>
      <Box width="100%">
        <ButtonGroup variant="contained" fullWidth>

          {buttons.map(({ icon, color, text, enabled, onClick }, i) =>
            <Button
              key={i}
              onClick={onClick}
              disabled={!enabled()}
              color={color}
              sx={{ textTransform: "none" }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                {icon}
                <Typography variant="body2">{text}</Typography>
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

      {/* Delete confirm 1 */}
      <Dialog open={deleteConfirm1Open} onClose={() => setDeleteConfirm1Open(false)}>
        <DialogTitle>Etes vous vraiment sûr de supprimer ce compte ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm1Open(false)}>Annuler</Button>
          <Button onClick={() => { setDeleteConfirm1Open(false); setDeleteConfirm2Open(true); }}>Ok</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm 2 */}
      <Dialog open={deleteConfirm2Open} onClose={() => setDeleteConfirm2Open(false)}>
        <DialogTitle>Vraiment ????</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm2Open(false)}>Annuler</Button>
          <Button onClick={handleAccountDelete}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountStats: React.FC<{ account: Account }> = ({ account }) => {
  const [totalExpense, servingsExpense, drinksExpense, snacksExpense] = useCurrentStatsForAccount(account);

  const rows = [[],
    [
      {
        icon: <Euro />,
        value: formatMoney(totalExpense),
        text: "Total dépensé",
      },
    ],
    [
      {
        icon: <LunchDining />,
        value: formatMoney(servingsExpense),
        text: "Sous-total des plats",
      },
      {
        icon: <Coffee />,
        value: formatMoney(drinksExpense),
        text: "Sous-total des boissons",
      },
      {
        icon: <Cookie />,
        value: formatMoney(snacksExpense),
        text: "Sous-total des snacks",
      },
    ],
  ] as const;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ pb: 2 }}>Statistiques</Typography>
        {/* For each row */}
        {rows.map((row, i) =>
          <div key={i}>
            <Divider />
            <Box display="flex" justifyContent="space-around" py="0.5em">
              {/* For each stat in the row */}
              {row.map(({ icon, value, text }, i) =>
                <Box key={i} display="flex" flexDirection="column" alignItems="center">
                  <Box display="flex" alignItems="center">
                    {icon}
                    <Typography variant="h5">&nbsp;{value}</Typography>
                  </Box>
                  <Typography variant="body2">{text}</Typography>
                </Box>
              )}
            </Box>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AccountDetails: React.FC<{ account: Account }> = (props) => {
  const { account } = props;
  const linesParams = { m: 2, mb: 0 };

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
    </>
  );
};

export default AccountDetails;
