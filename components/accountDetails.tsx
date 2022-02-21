import { AccountBalanceWallet, Error, Close, SportsBar, Edit, DeleteForever, LocalBar, LocalBarOutlined, Savings, SavingsOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, ButtonGroup, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Account, School } from "../pages/accounts/[id]";
import AccountEditDialog from "./accountEditDialog";

type AccountDetailsProps = {
  account: Account,
};

const schoolToImage = (school: School) => {
  return `/schools/${School[school].toLowerCase()}.png`;
};

const formatQuantity = (v: number) => v.toLocaleString() + " L";
const formatMoney = (v: number) => (v / 100).toLocaleString() + " €";

const AccountHeader = ({ account }: AccountDetailsProps) => {
  return (
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={3}>
            <Avatar
              alt="School logo"
              src={schoolToImage(account.school)}
              sx={{ width: 64, height: 64 }}
            />
          </Grid>
          <Grid container item xs={9} direction="column" justifyContent="center">
            <Typography variant="h5">{account.firstName} {account.lastName.toUpperCase()}</Typography>
            <Typography variant="overline">{account.id}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const AccountBalanceAndRecharge = ({ account }: AccountDetailsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogClose = () => setDialogOpen(false);

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
            autoFocus
            placeholder="Montant (€)"
            variant="standard"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Annuler</Button>
          <Button onClick={handleDialogClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountActions = ({ account }: AccountDetailsProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm1Open, setDeleteConfirm1Open] = useState(false);
  const [deleteConfirm2Open, setDeleteConfirm2Open] = useState(false);

  const buttons = [
    {
      icon: <SportsBar fontSize="large" />,
      color: undefined,
      text: "Encaisser",
      onClick: () => setEditDialogOpen(true),
    },
    {
      icon: <Edit fontSize="large" />,
      color: "secondary",
      text: "Editer",
      onClick: () => setEditDialogOpen(true),
    },
    {
      icon: <DeleteForever fontSize="large" />,
      color: "error",
      text: "Supprimer",
      onClick: () => setDeleteConfirm1Open(true),
    },
  ] as const;

  return (
    <>
      <Box width="100%">
        <ButtonGroup variant="contained" fullWidth>

          {buttons.map(({ icon, color, text, onClick }, i) =>
            <Button
              key={i}
              onClick={onClick}
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
      />

      {/* Delete confirm 1 */}
      <Dialog open={deleteConfirm1Open} onClose={() => setDeleteConfirm1Open(false)}>
        <DialogTitle>Etes vous vraiment sûr de supprimer ce compte ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm1Open(false)}>Annuler</Button>
          <Button onClick={() => {setDeleteConfirm1Open(false); setDeleteConfirm2Open(true);}}>Ok</Button>
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

const AccountNotAMember = ({ account }: AccountDetailsProps) => {
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

const AccountStats = ({ account }: AccountDetailsProps) => {
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
        {rows.map((row) =>
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AccountDetails = (props: AccountDetailsProps) => {
  const { account } = props;
  const linesParams = { m: 2, mb: 0 };

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
