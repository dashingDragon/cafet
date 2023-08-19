import { Coffee, Cookie, Euro, LunchDining, Savings } from '@mui/icons-material';
import {  Box, Card, CardContent, CardHeader, Divider, List, Typography } from '@mui/material';
import React from 'react';
import { useCurrentStats } from '../lib/firestoreHooks';
import { imageLoader } from '../pages/_app';
import Image from 'next/image';

const formatMoney = (n: number) => (n / 100).toFixed(2) + ' €';

const Stats: React.FC = () => {
    const stats = useCurrentStats();

    const rows = [
        [
            {
                icon: <LunchDining />,
                value: stats.servingsOrdered,
                text: 'Plats vendus',
            },
            {
                icon: <Coffee />,
                value: stats.drinksOrdered,
                text: 'Boissons vendues',
            },
            {
                icon: <Cookie />,
                value: stats.snacksOrdered,
                text: 'Snacks vendus',
            },
            {
                icon: <Euro />,
                value: formatMoney(stats.totalMoneySpent),
                text: 'Recettes totales',
            },
        ],
    ] as const;

    return (
        <>
            <Card sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '16px',
                mt: '48px',
                borderRadius: '20px',
                overflow: 'visible',
                px: '32px',
                height: '40px',
                background: theme => theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                    : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
            }}>
                <Typography variant="h5">Statistiques globales</Typography>
                <Box sx={{ marginTop: '-35px' }}>
                    <Image
                        loader={imageLoader}
                        src={'/svg/stats.svg'}
                        alt={'Success image'}
                        width={90}
                        height={90}
                    />
                </Box>
            </Card>
            <Card sx={{ mx: '16px', borderRadius: '20px' }}>
                <CardContent>
                    {/* For each row */}
                    {rows.map((row, i) =>
                        <Box key={i} display="flex" justifyContent="space-around" flexDirection={'column'}>
                            {/* For each stat in the row */}
                            {row.map(({ icon, value, text }, i) => (
                                <React.Fragment key={i}>
                                    {i === row.length - 1 ? <Divider /> : null}
                                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" py={1}>
                                        <Box display="flex" alignItems="center">
                                            {icon}
                                            <Typography variant="h5">&nbsp;{value}</Typography>
                                        </Box>
                                        <Typography variant="body1">{text}</Typography>
                                    </Box>
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default Stats;
