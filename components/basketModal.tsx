import { Box, Button, CardMedia, Fab, IconButton, Modal, ModalProps, Stack, Typography } from '@mui/material';
import { ArrowBack, Favorite, Remove } from '@mui/icons-material';
import { Product, ProductWithQty } from '../lib/products';
import MiniProductCard from './miniProductCard';
import { useRouter } from 'next/router';
import { Account } from '../lib/accounts';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';
import { useProducts } from '../lib/firestoreHooks';
import { useState } from 'react';
import { OrderItemLine } from './orderList';

const BasketModal: React.FC<{
    open: boolean,
    setBasketOpen: (b: boolean) => void,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    account: Account,
}> = ({open, setBasketOpen, basket, setBasket, account}) => {
    const router = useRouter();
    const products = useProducts();
    const makeTransaction = useMakeTransaction();
    const [loading, setLoading] = useState(false);

    const makeOrder = async () => {
        if (basket.values().next()) {
            const payload = {
                account: account,
                productsWithQty: Array.from(basket.values())
                    .filter((s) => Object.values(s.sizeWithQuantities).some(value => value !== null && value !== undefined && value !== 0)),
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

    return (
        <Modal
            open={open}
            onClose={() => setBasketOpen(false)}
            hideBackdrop
        >
            <Box sx={{
                flexGrow: 1,
                background: theme => theme.palette.background.default,
                height: '100%',
                maxHeight: '100%',
                overflow: 'auto',
                position: 'relative',
            }}>
                <>
                    <Fab onClick={() => setBasketOpen(false)} sx={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                    }}>
                        <ArrowBack />
                    </Fab>
                    <Typography variant="h3" sx={{
                        width: '100%',
                        textAlign: 'center',
                        mt: '16px',
                    }}>
                        Panier
                    </Typography>
                    <Stack direction="column" padding='16px' spacing={'32px'}>
                        {Array.from(basket.values()).map((productWithQty) => (
                            <MiniProductCard
                                key={productWithQty.product.name}
                                productWithQty={productWithQty}
                                basket={basket}
                                setBasket={setBasket}
                            />
                        ))}
                    </Stack>
                    <Box m={2}>
                        {Array.from(basket.values()).map((productWithQty) => (
                            Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                                (quantity > 0 && <OrderItemLine productWithQty={productWithQty} quantity={quantity} size={size} /> ))))
                        }
                    </Box>
                    <Box m={2} display="flex" justifyContent={'flex-end'}>
                        <Button variant="contained" onClick={makeOrder}>
                            Commander
                        </Button>
                    </Box>
                </>
            </Box>
        </Modal>
    );
};

export default BasketModal;