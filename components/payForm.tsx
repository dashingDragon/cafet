import { ChevronRight, ShoppingBasket } from '@mui/icons-material';
import { Box, Button, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { useProducts } from '../lib/firestoreHooks';
import { Product, ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import { typeTranslation } from './productList';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';
import { ShortProductCard } from './shortProductCard';
import BasketModal from './basketModal';

const ProductShortCardList: React.FC<{
  basket: Map<string, ProductWithQty>,
  setBasket: (m: Map<string, ProductWithQty>) => void,
  priceLimit: number,
}> = ({ basket, setBasket, priceLimit }) => {
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
                        <Typography variant="h5">{typeTranslation[type]}</Typography>
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
                                />
                            </Box>
                        ))}
                    </Stack>
                </React.Fragment>
            ))}
        </>
    );
};

const PayForm: React.FC<{ account: Account }> = ({ account }) => {
    // State
    const [basket, setBasket] = useState(new Map<string, ProductWithQty>());
    const [basketOpen, setBasketOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [nbItems, setNbItems] = useState(0);

    useEffect(() => {
        let priceProducts = 0;

        for (const productWithQty of basket.values()) {
            if (productWithQty.product.sizeWithPrices && productWithQty.sizeWithQuantities) {
                Object.keys(productWithQty.sizeWithQuantities).forEach(size => {
                    const priceForSize = productWithQty.product.sizeWithPrices[size];
                    const quantityForSize = productWithQty.sizeWithQuantities[size];
                    if (priceForSize && quantityForSize) {
                        priceProducts += productWithQty.product.sizeWithPrices[size] * productWithQty.sizeWithQuantities[size];
                    }
                }
                );
            }
        }

        setTotal(priceProducts);
    }, [basket]);

    // Compute money stuff
    const canBeCompleted = () => {
        return total <= account.balance;
    };

    return (
        <>
            <Box m={'8px'} pb='64px'>
                <ProductShortCardList basket={basket} setBasket={setBasket} priceLimit={account.balance - total} />
            </Box>
            <Box m={'8px'}>
                {total > 0 && (
                    <Button
                        disabled={!canBeCompleted()}
                        onClick={() => setBasketOpen(true)}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            bottom: '16px',
                            position: 'fixed',
                            width: 'calc(100% - 16px)',
                        }}
                    >
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" title="Payer">
                            <ShoppingBasket />
                            <Typography variant="h6">Panier: <strong>{formatMoney(total)}</strong></Typography>
                            <ChevronRight fontSize="large" sx={{ height: '40px', width: '40px' }} />
                        </Box>
                    </Button>
                )}
            </Box>
            <BasketModal open={basketOpen} setBasketOpen={setBasketOpen} basket={basket} setBasket={setBasket} account={account} priceLimit={account.balance - total} />
        </>
    );
};

export default PayForm;
