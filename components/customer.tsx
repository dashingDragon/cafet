import { Stack, Typography } from '@mui/material';
import React from 'react';

export const CustomerPage: React.FC = () => {

    return (
        <Stack
            flexGrow={1}
            direction="column"
            pb={4}
            overflow='auto'
            maxHeight='100%'
            alignItems='center'
        >
            <Typography variant="h5" mb={2}>
                Ma commande :
            </Typography>
        </Stack>
    );
};