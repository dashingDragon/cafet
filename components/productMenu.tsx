import { ChevronRight, ShoppingBasket } from '@mui/icons-material';
import { Alert, AlertColor, Box, Button, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import BasketModal from './basketModal';
import { useOrderEditor } from '../lib/firestoreHooks';
import { getIngredientPrice } from '../lib/ingredients';
import { useRouter } from 'next/router';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';
import { ProductShortCardList } from './lists/productShortCardList';
import { SnackbarContext } from './scrollableContainer';
import { TransactionOrder } from '../lib/transactions';
import logger from '../lib/logger';

const ProductMenu: React.FC<{ account: Account, order?: TransactionOrder }> = ({ account, order }) => {
    const [basket, setBasket] = useState(new Map<string, ProductWithQty>());
    const [basketOpen, setBasketOpen] = useState(false);
    const [basketPrice, setBasketPrice] = useState(0);
    const [servingCount, setServingCount] = useState(0);
    const router = useRouter();
    const makeTransaction = useMakeTransaction();
    const editOrder = useOrderEditor();

    const setSnackbarMessage = useContext(SnackbarContext);

    const handleMakeOrder = async (needPreparation: boolean, setLoading: (b: boolean) => void) => {
        if (basket.values().next()) {
            const payload = {
                account: account,
                productsWithQty: Array.from(basket.values())
                    .filter((s) => Object.values(s.sizeWithQuantities).some(value => value !== null && value !== undefined && value !== 0)),
                needPreparation: needPreparation,
            };
            setLoading(true);
            const result = await makeTransaction(payload);
            setLoading(false);
            if (result.data.success) {
                router.push(`/success/${account.id}`);
            } else {
                router.push(`/error/${account.id}`);
            }
        }
    };

    const handleEditOrder = async (needPreparation: boolean, setLoading: (b: boolean) => void) => {
        if (order && basket.values().next()) {
            const payload = {
                order: order as TransactionOrder,
                productsWithQty: Array.from(basket.values())
                    .filter((s) => Object.values(s.sizeWithQuantities).some(value => value !== null && value !== undefined && value !== 0)),
                price: basketPrice,
                needPreparation: needPreparation,
            };
            setLoading(true);
            const {success, message} = await editOrder(payload);
            setLoading(false);
            if (success) {
                setSnackbarMessage(message, 'success');
                router.back();
            } else {
                setSnackbarMessage(message, 'error');
                router.back();
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
        logger.log(basket);
    }, [basket]);

    useEffect(() => {
        if (order) {
            for (const productWithQty of (order as TransactionOrder).productsWithQty) {
                basket.set(productWithQty.product.id, JSON.parse(JSON.stringify(productWithQty)));
            }
            setBasket(new Map(basket));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order]);

    // Compute money stuff
    const canBeCompleted = () => {
        return basketPrice <= account.balance;
    };

    return (
        <>
            {/* Menu */}
            <ProductShortCardList
                basket={basket}
                setBasket={setBasket}
                priceLimit={account.balance - basketPrice}
                servingCount={servingCount}
                setSnackbarMessage={setSnackbarMessage}
            />

            {/* Checkout floating bar */}
            {basketPrice > 0 && (
                <Button
                    disabled={!canBeCompleted()}
                    onClick={() => setBasketOpen(true)}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        bottom: '16px',
                        position: 'fixed',
                        width: 'calc(100% - 64px)',
                        maxWidth: 'calc(900px - 64px)',
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

            {/* Basket Modal */}
            <BasketModal
                open={basketOpen}
                setBasketOpen={setBasketOpen}
                basket={basket}
                setBasket={setBasket}
                account={account}
                basketPrice={basketPrice}
                servingCount={servingCount}
                actionCallback={order ? handleEditOrder : handleMakeOrder}
                order={order}
            />
        </>
    );
};

export default ProductMenu;
