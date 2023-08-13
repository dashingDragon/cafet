import { Coffee, Cookie, Euro, LunchDining, Savings } from '@mui/icons-material';
import {  Box, Card, CardContent, CardHeader, List, Typography } from '@mui/material';
import React from 'react';
import { useCurrentStats } from '../lib/firestoreHooks';

const formatMoney = (n: number) => (n / 100).toFixed(2) + ' €';

const Stats: React.FC = () => {
    const [totalProfits, servingsProfits, drinksProfits, snacksProfits] = useCurrentStats();

    const rows = [
        [
            {
                icon: <LunchDining />,
                value: formatMoney(servingsProfits),
                text: 'Vente des plats',
            },
            {
                icon: <Coffee />,
                value: formatMoney(drinksProfits),
                text: 'Vente des boissons',
            },
            {
                icon: <Cookie />,
                value: formatMoney(snacksProfits),
                text: 'Vente des snacks',
            },
        ],
        [
            {
                icon: <Euro />,
                value: formatMoney(totalProfits),
                text: 'Total vendu',
            },
        ],
    ] as const;

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{ pb: 2 }}>Statistiques</Typography>
                {/* For each row */}
                {rows.map((row, i) =>
                    <div key={i}>
                        <Box display="flex" justifyContent="space-around" flexDirection={'column'}>
                            {/* For each stat in the row */}
                            {row.map(({ icon, value, text }, i) =>
                                <Box key={i} display="flex" flexDirection="row" alignItems="center" justifyContent={'space-between'} py={1}>
                                    <Box display="flex" alignItems="center">
                                        {icon}
                                        <Typography variant="h5">&nbsp;{value}</Typography>
                                    </Box>
                                    <Typography variant="body1">{text}</Typography>
                                </Box>
                            )}
                        </Box>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Stats;
