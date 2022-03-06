import { Dialog, DialogContent, DialogTitle, DialogActions, FormControl, TextField, Button, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { Account, School } from "../lib/accounts";

type AccountEditDialogProps = {
  account: Account | null,
  open: boolean,
  onClose: () => void,
  onSubmit: (firstName: string, lastName: string, school: School) => void,
}

const AccountEditDialog = ({ account, open, onClose, onSubmit }: AccountEditDialogProps) => {
  const allSchools = [
    { value: School.Ensimag, name: School[School.Ensimag] },
    { value: School.Phelma, name: School[School.Phelma] },
    { value: School.E3, name: School[School.E3] },
    { value: School.Papet, name: School[School.Papet] },
    { value: School.Gi, name: School[School.Gi] },
    { value: School.Polytech, name: School[School.Polytech] },
    { value: School.Esisar, name: School[School.Esisar] },
    { value: School.Iae, name: School[School.Iae] },
    { value: School.Uga, name: School[School.Uga] },
    { value: School.Unknown, name: School[School.Unknown] },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState(account?.firstName ?? "");
  const [lastName, setLastName] = useState(account?.lastName ?? "");
  const [school, setSchool] = useState(account?.school ?? School.Unknown);

  useEffect(() => {
    console.log("Reset form");

    setSubmitting(false);
    setFirstName(account?.firstName ?? "");
    setLastName(account?.lastName ?? "");
    setSchool(account?.school ?? School.Unknown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  const handleSubmit = () => {
    onSubmit(firstName, lastName, school);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {account !== null ? "Editer le compte" : "Créer un compte"}
      </DialogTitle>
      <DialogContent>
        <TextField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={submitting}
          placeholder="Prénom"
          variant="standard"
          fullWidth
          sx={{ my: 1 }}
        />
        <TextField
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={submitting}
          placeholder="Nom"
          variant="standard"
          fullWidth
          sx={{ my: 1 }}
        />
        <FormControl fullWidth sx={{ my: 1 }}>
          <Select
            value={school}
            onChange={(e) => setSchool(e.target.value as School)}
            disabled={submitting}
            label="Ecole"
            placeholder="Ecole"
            variant="standard"
          >
            {allSchools.map(({ value, name }) => (
              <MenuItem key={value} value={value}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountEditDialog;
