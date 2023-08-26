import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCustomers } from '../../lib/firebaseFunctionHooks';
import { useMakeStaff } from '../../lib/firestoreHooks';
import { Account } from '../../lib/accounts';

export const CustomerDialog: React.FC<{
  open: boolean,
  onClose: () => void,
}> = ({ open, onClose }) => {
    const makeStaff = useMakeStaff();
    const [customers, refreshCustomers] = useCustomers();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [newStaff, setNewStaff] = useState<Account | undefined>(undefined);

    useEffect(() => {
        if (open) {
            refreshCustomers().catch(console.error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleClickUser = async (user: Account) => {
        setNewStaff(user);
        setConfirmOpen(true);
    };

    const handleMakeStaff = async () => {
        if (!newStaff) {
            alert('Error: no staff has been chosen');
            return;
        }
        setConfirmOpen(false);
        onClose();
        await makeStaff(newStaff, true);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>
                    Liste des comptes non staffs (cliquez pour en faire des staffs)
                </DialogTitle>
                <DialogContent>
                    <List>
                        {customers.map((user) => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton onClick={() => handleClickUser(user)}>
                                    <ListItemText
                                        primary={`${user.firstName} ${user.lastName}`}
                                        secondary={user.email}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>
                     Voulez vous vraiment rendre {newStaff?.firstName} {newStaff?.lastName} staff ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={handleMakeStaff} variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CustomerDialog;
