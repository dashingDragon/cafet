import { ChevronRight, ShoppingBasket } from '@mui/icons-material';
import { Alert, AlertColor, Box, Button, Card, Slide, SlideProps, Snackbar, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { useProducts } from '../lib/firestoreHooks';
import { ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import { typeTranslation } from './productList';
import { ShortProductCard } from './shortProductCard';
import BasketModal from './basketModal';
import { getIngredientPrice } from '../lib/ingredients';

const ProductShortCardList: React.FC<{
  basket: Map<string, ProductWithQty>,
  setBasket: (m: Map<string, ProductWithQty>) => void,
  priceLimit: number,
  setSnackbarMessage: (message: string, severity: AlertColor) => void,
}> = ({ basket, setBasket, priceLimit, setSnackbarMessage }) => {
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

type TransitionProps = Omit<SlideProps, 'direction'>;

const TransitionRight = (props: TransitionProps) => {
    return <Slide {...props} direction="right" />;
};

const PayForm: React.FC<{ account: Account }> = ({ account }) => {
    // State
    const [basket, setBasket] = useState(new Map<string, ProductWithQty>());
    const [basketOpen, setBasketOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');

    const setSnackbarMessage = (message: string, severity: AlertColor) => {
        setMessage(message);
        setSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        let priceProducts = 0;

        for (const productWithQty of basket.values()) {
            if (productWithQty.product.sizeWithPrices && productWithQty.sizeWithQuantities) {
                Object.keys(productWithQty.sizeWithQuantities).forEach(size => {
                    const priceForSize = productWithQty.product.sizeWithPrices[size];
                    const quantityForSize = productWithQty.sizeWithQuantities[size];
                    const ingredientsPrice = getIngredientPrice(productWithQty.product.ingredients);
                    if (priceForSize && quantityForSize) {
                        priceProducts += productWithQty.product.sizeWithPrices[size] * productWithQty.sizeWithQuantities[size] + ingredientsPrice;
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
                <ProductShortCardList basket={basket} setBasket={setBasket} priceLimit={account.balance - total} setSnackbarMessage={setSnackbarMessage} />
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
            <Snackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                TransitionComponent={TransitionRight}
                key={'transition'}
                autoHideDuration={6000}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <BasketModal
                open={basketOpen}
                setBasketOpen={setBasketOpen}
                basket={basket}
                setBasket={setBasket}
                account={account}
                priceLimit={account.balance - total}
            />
        </>
    );
};

export default PayForm;
