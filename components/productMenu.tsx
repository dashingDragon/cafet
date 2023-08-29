import { ChevronRight, ShoppingBasket } from '@mui/icons-material';
import { Alert, AlertColor, Box, Button, Slide, SlideProps, Snackbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import BasketModal from './basketModal';
import { getIngredientPrice } from '../lib/ingredients';
import { useRouter } from 'next/router';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';
import { ProductShortCardList } from './lists/productShortCardList';

type TransitionProps = Omit<SlideProps, 'direction'>;

const TransitionRight = (props: TransitionProps) => {
    return <Slide {...props} direction="right" />;
};

const ProductMenu: React.FC<{ account: Account}> = ({ account }) => {
    // State
    const [basket, setBasket] = useState(new Map<string, ProductWithQty>());
    const [basketOpen, setBasketOpen] = useState(false);
    const [basketPrice, setBasketPrice] = useState(0);
    const [servingCount, setServingCount] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');
    const router = useRouter();
    const makeTransaction = useMakeTransaction();

    const setSnackbarMessage = (message: string, severity: AlertColor) => {
        setMessage(message);
        setSeverity(severity);
        setSnackbarOpen(true);
    };

    const makeOrder = async (needPreparation: boolean, setLoading: (b: boolean) => void) => {
        if (basket.values().next()) {
            const payload = {
                account: account,
                productsWithQty: Array.from(basket.values())
                    .filter((s) => Object.values(s.sizeWithQuantities).some(value => value !== null && value !== undefined && value !== 0)),
                needPreparation: needPreparation,
            };
            console.log(payload);
            setLoading(true);
            const result = await makeTransaction(payload);
            console.log(result);
            if (result.data.success) {
                router.push(`/success/${account.id}`);
            } else {
                router.push(`/error/${account.id}`);
            }
        }
    };

    useEffect(() => {
        let priceProducts = 0;
        let nbServings = 0;

        for (const productWithQty of basket.values()) {
            if (productWithQty.product.sizeWithPrices && productWithQty.sizeWithQuantities) {
                Object.keys(productWithQty.sizeWithQuantities).forEach(size => {
                    const priceForSize = productWithQty.product.sizeWithPrices[size];
                    const quantityForSize = productWithQty.sizeWithQuantities[size];
                    const ingredientsPrice = getIngredientPrice(productWithQty.product.ingredients);
                    if (priceForSize && quantityForSize) {
                        priceProducts += productWithQty.product.sizeWithPrices[size] * productWithQty.sizeWithQuantities[size] + ingredientsPrice;
                    }

                    if (productWithQty.product.type === 'serving') {
                        nbServings += productWithQty.sizeWithQuantities[size];
                    }
                });
            }
        }

        setBasketPrice(priceProducts);
        setServingCount(nbServings);
    }, [basket]);

    // Compute money stuff
    const canBeCompleted = () => {
        return basketPrice <= account.balance;
    };

    return (
        <>
            {/* Menu */}
            <Box m={'8px'}>
                <ProductShortCardList
                    basket={basket}
                    setBasket={setBasket}
                    priceLimit={account.balance - basketPrice}
                    servingCount={servingCount}
                    setSnackbarMessage={setSnackbarMessage}
                />
            </Box>

            {/* Checkout floating bar */}
            <Box m={'8px'}>
                {basketPrice > 0 && (
                    <Button
                        disabled={!canBeCompleted()}
                        onClick={() => setBasketOpen(true)}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            bottom: '16px',
                            position: 'fixed',
                            width: 'calc(100% - 16px)',
                            zIndex: 20,
                        }}
                    >
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" title="Payer">
                            <ShoppingBasket />
                            <Typography variant="h6">Panier: <strong>{formatMoney(basketPrice)}</strong></Typography>
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

            {/* Basket Modal */}
            <BasketModal
                open={basketOpen}
                setBasketOpen={setBasketOpen}
                basket={basket}
                setBasket={setBasket}
                account={account}
                basketPrice={basketPrice}
                servingCount={servingCount}
                actionCallback={makeOrder}
            />
        </>
    );
};

export default ProductMenu;
