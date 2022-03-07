import { AccountBalanceWallet, Error, Close, SportsBar, Edit, DeleteForever, LocalBar, LocalBarOutlined, Savings, SavingsOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, ButtonGroup, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Account, School } from "../lib/accounts";
import { useRechargeTransactionMaker } from "../lib/firestoreHooks";
import AccountEditDialog from "./accountEditDialog";

const schoolToImage = (school: School) => {
  return `/schools/${School[school].toLowerCase()}.png`;
};

const formatQuantity = (v: number) => v.toLocaleString() + " L";
const formatMoney = (v: number) => (v / 100).toFixed(2) + " €";

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
  const recharge = useRechargeTransactionMaker();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(null as number | null);

  const handleDialogClose = () => {
    setRechargeAmount(null);
    setDialogOpen(false)
  };

  const handleRecharge = async () => {
    setDialogOpen(false);
    await recharge(account, (rechargeAmount ?? 0) * 100);
    setRechargeAmount(null);
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
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
            onChange={(e) => setRechargeAmount(e.target.value.length == 0 ? null : +e.target.value)}
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

  const buttons = [
    {
      icon: <SportsBar fontSize="large" />,
      color: undefined,
      text: "Encaisser",
      enabled: () => account.balance > 0,
      onClick: () => router.push(`/accounts/${account.id}/pay`),
    },
    {
      icon: <Edit fontSize="large" />,
      color: "secondary",
      text: "Editer",
      enabled: () => true,
      onClick: () => setEditDialogOpen(true),
    },
    {
      icon: <DeleteForever fontSize="large" />,
      color: "error",
      text: "Supprimer",
      enabled: () => true,
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
        onSubmit={(a, b, c) => console.log(a, b, c)}
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
          <Button onClick={() => setDeleteConfirm2Open(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountNotAMember: React.FC<{ account: Account }> = ({ account }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="contained"
        size="large"
        fullWidth
        sx={{ textTransform: "none" }}
        color="error"
      >
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          <Box display="flex" alignItems="center" >
            <Close fontSize="large" sx={{ mr: 1 }} />
            <Typography variant="h5">Pas un membre</Typography>
          </Box>
          <Typography variant="body2">Cliquez pour en faire un membre</Typography>
        </Box>
      </Button>

      {/* Dialog make member */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Faire membre ?</DialogTitle>
        <DialogActions>
          <Button onClick={handleDialogClose}>Annuler</Button>
          <Button onClick={handleDialogClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountStats: React.FC<{ account: Account }> = ({ account }) => {
  // TODO: replace with real data
  const rows = [
    [
      {
        icon: <LocalBar />,
        value: formatQuantity(account.stats.quantityDrank),
        text: "Bu au total",
      },
      {
        icon: <LocalBarOutlined />,
        value: formatQuantity(account.stats.quantityDrank),
        text: "Bu ce soir",
      },
    ],
    [
      {
        icon: <Savings />,
        value: formatMoney(account.stats.totalMoney),
        text: "Rechargé au total",
      },
      {
        icon: <SavingsOutlined />,
        value: formatMoney(account.stats.totalMoney),
        text: "Rechargé ce soir",
      },
    ],
    [
      {
        icon: <SportsBar />,
        value: formatMoney(account.stats.totalMoney),
        text: "Bu ce soir",
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
        {account.isMember
          ? <AccountActions {...props} />
          : <AccountNotAMember {...props} />
        }
      </Box>
      <Box {...linesParams}>
        <AccountStats {...props} />
      </Box>
    </>
  );
};

export default AccountDetails;
