import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Account, School, allSchools } from '../../lib/accounts';
import logger from '../../lib/logger';

const AccountEditDialog: React.FC<{
  account: Account | null,
  open: boolean,
  onClose: () => void,
  onSubmit: (firstName: string, lastName: string, school: School, phone: string, email: string) => void
}> = ({ account, open, onClose, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false);
    const [firstName, setFirstName] = useState(account?.firstName ?? '');
    const [lastName, setLastName] = useState(account?.lastName ?? '');
    const [school, setSchool] = useState(account?.school ?? School.Unknown);
    const [phone, setPhone] = useState(account?.phone ?? '');
    const [email, setEmail] = useState(account?.email ?? '');

    useEffect(() => {
        logger.log('Reset form');

        setSubmitting(false);
        setFirstName(account?.firstName ?? '');
        setLastName(account?.lastName ?? '');
        setSchool(account?.school ?? School.Unknown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);


    const handleSubmit = () => {
        if (firstName.length === 0 || lastName.length === 0) {
            alert('Pas de noms vides !');
            return;
        }

        onSubmit(firstName, lastName, school, phone, email);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {account !== null ? 'Editer le compte' : 'Créer un compte'}
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
                <TextField
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    placeholder="Numéro de téléphone"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
                <TextField
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    placeholder="Email"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: (theme) => theme.colors.main }}>Annuler</Button>
                <Button onClick={handleSubmit} variant="contained">Ok</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountEditDialog;
