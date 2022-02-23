import { Dialog, DialogContent, DialogTitle, DialogActions, FormControl, TextField, Button, Select, MenuItem } from "@mui/material";
import { Account, School } from "../lib/accounts";

type AccountEditDialogProps = {
  account: Account,
  open: boolean,
  onClose: () => void,
}

const AccountEditDialog = ({ account, open, onClose }: AccountEditDialogProps) => {
  const allSchools = Object.values(School).filter((s) => isNaN(+s));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editer compte</DialogTitle>
      <DialogContent>
        <TextField
          value={account.firstName}
          placeholder="Prénom"
          variant="standard"
          fullWidth
          sx={{ my: 1 }}
        />
        <TextField
          value={account.lastName}
          placeholder="Nom"
          variant="standard"
          fullWidth
          sx={{ my: 1 }}
        />
        <FormControl fullWidth sx={{ my: 1 }}>
          <Select
            value={School[account.school]}
            label="Ecole"
            placeholder="Ecole"
            variant="standard"
          >
            {allSchools.map((school, i) => (
              <MenuItem key={i} value={school}>{school}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountEditDialog;
