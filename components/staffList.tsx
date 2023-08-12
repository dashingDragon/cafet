import { Avatar, Box, Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSetStaffAvailability, useStaffUser } from '../lib/firestoreHooks';
import { Staff } from '../lib/staffs';

const StaffItem: React.FC<{ staff: Staff }> = ({ staff }) => {
    const staffMe = useStaffUser();
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
                onClick={staffMe?.isAdmin ? () => setAvailableDialogOpen(true) : () => {}}
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
                            {staff.name.split(' ').map(p => p[0].toUpperCase()).join('')}
                        </Typography>

                    </Avatar>
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                    >
                        {staff.name}
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

const StaffList: React.FC<{ staffs: Staff[] }> = ({ staffs }) => {
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
