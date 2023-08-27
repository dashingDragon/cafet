import { Avatar, Box, Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSetStaffAvailability } from '../../lib/firestoreHooks';
import { Account } from '../../lib/accounts';

const StaffItem: React.FC<{ staff: Account }> = ({ staff }) => {
    const setStaffAvailability = useSetStaffAvailability();
    const [availableDialogOpen, setAvailableDialogOpen] = useState(false);

    const handleChangeAvailability = async (isAvailable: boolean) => {
        setAvailableDialogOpen(false);
        if (isAvailable != staff.isAvailable) {
            await setStaffAvailability(staff, !staff.isAvailable);
        }
    };

    return (
        <>
            <Button
                onClick={() => setAvailableDialogOpen(true)}
                variant="contained"
                color={staff.isAvailable ? 'success' : 'warning'}
                fullWidth
                sx={{ textTransform: 'none' }}
            >
                <Box display="flex" alignItems="center" width="100%">
                    <Avatar sx={{ mr: 1, background: 'default', fontSize: '12px', color: 'white' }}>
                        <Typography
                            variant="body1"
                        >
                            {[staff.firstName[0].toUpperCase(), staff.lastName[0].toUpperCase()].join('')}
                        </Typography>

                    </Avatar>
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                    >
                        {staff.firstName} {staff.lastName}
                    </Typography>
                </Box>
            </Button>

            {/* Change availability dialog */}
            <Dialog open={availableDialogOpen} onClose={() => setAvailableDialogOpen(false)}>
                <DialogTitle>
                    {'Ce staff est-il disponible ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => handleChangeAvailability(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={() => handleChangeAvailability(true)} variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const StaffList: React.FC<{ staffs: Account[] }> = ({ staffs }) => {
    return (
        <Box m={1}>
            {staffs.map((staff) =>
                <Box key={staff.id} mb={1}>
                    <StaffItem staff={staff} />
                </Box>
            )}
        </Box>
    );
};

export default StaffList;
