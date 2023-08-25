import { AlertColor, Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useProducts } from '../../lib/firestoreHooks';
import { ProductWithQty } from '../../lib/products';
import { ShortProductCard } from '../cards/shortProductCard';
import { typeTranslation } from './productList';

export const ProductShortCardList: React.FC<{
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    servingCount: number,
    setSnackbarMessage: (message: string, severity: AlertColor) => void,
}> = ({ basket, setBasket, priceLimit, servingCount, setSnackbarMessage }) => {
    const products = useProducts();

    return (
        <>
            {Object.keys(typeTranslation).map((type) => (
                <React.Fragment key={type}>
                    <Card sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        my: '16px',
                        borderRadius: '20px',
                        overflow: 'visible',
                        px: '32px',
                        height: '40px',
                        background: theme => theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                            : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                    }}>
                        <Typography variant="h5" sx={{
                            color: theme => theme.palette.mode === 'light' ? 'hsla(326, 100%, 20%, 1)' : 'hsla(326, 100%, 90%, 1)',
                        }}>{typeTranslation[type]}</Typography>
                    </Card>
                    <Stack
                        direction={'row'}
                        justifyContent={'flex-start'}
                        sx={{
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            '&-ms-overflow-style:': {
                                display: 'none',
                            },
                        }}
                        gap={2}
                        mb={4}
                    >
                        {products.filter(p => p.type === type).map((product) => (
                            <Box key={product.name}>
                                <ShortProductCard
                                    product={product}
                                    basket={basket}
                                    setBasket={setBasket}
                                    priceLimit={priceLimit}
                                    servingCount={servingCount}
                                    setSnackbarMessage={setSnackbarMessage}
                                />
                            </Box>
                        ))}
                    </Stack>
                </React.Fragment>
            ))}
        </>
    );
};