import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PendingStaff, useMakeStaff, usePendingStaffs } from '../lib/firebaseFunctionHooks';

export const PendingStaffsDialog: React.FC<{
  open: boolean,
  onClose: () => void,
}> = ({ open, onClose }) => {
    const [pendingStaffs, refreshPendingStaffs] = usePendingStaffs();
    const makeStaff = useMakeStaff();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [choosenStaff, setChoosenStaff] = useState(null as PendingStaff | null);

    useEffect(() => {
        if (open) {
            refreshPendingStaffs().catch(console.error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleClickUser = async (user: PendingStaff) => {
        setChoosenStaff(user);
        setConfirmOpen(true);
    };

    const handleMakeStaff = async () => {
        if (!choosenStaff) {
            alert('wtf');
            return;
        }
        const staff = choosenStaff!;

        setConfirmOpen(false);
        onClose();
        await makeStaff({ uid: staff.uid, name: staff.name });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>
                    Liste des comptes non staffs (cliquez pour en faire des staffs)
                </DialogTitle>
                <DialogContent sx={{ width: 300 }}>
                    <List>
                        {pendingStaffs.map((user) => (
                            <ListItem key={user.uid} disablePadding>
                                <ListItemButton onClick={() => handleClickUser(user)}>
                                    <ListItemText
                                        primary={user.name}
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
                     Voulez vous vraiment rendre {choosenStaff?.name} staff ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
                    <Button onClick={handleMakeStaff}>Oui</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PendingStaffsDialog;
