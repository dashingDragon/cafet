import { Box, Button, Checkbox, CircularProgress, Fab, FormControlLabel, IconButton, Modal, ModalProps, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ProductWithQty } from '../lib/products';
import MiniProductCard from './cards/miniProductCard';
import { Account } from '../lib/accounts';
import { useState } from 'react';
import { OrderItemLine } from './lists/orderList';
import { formatMoney } from './accountDetails';
import { useFirestoreUser } from '../lib/firestoreHooks';

const BasketModal: React.FC<{
    open: boolean,
    setBasketOpen: (b: boolean) => void,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    basketPrice: number,
    servingCount: number,
    actionCallback: (b: boolean, setLoading: (b: boolean) => void) => void,
    account: Account,
}> = ({open, setBasketOpen, basket, setBasket, account, basketPrice, servingCount, actionCallback }) => {
    const [loading, setLoading] = useState(false);
    const [needPreparation, setNeedPreparation] = useState(true);
    const user = useFirestoreUser();

    return (
        <Modal
            open={open}
            onClose={() => setBasketOpen(false)}
            sx={{
                width: '100%',
                maxWidth: '900px',
            }}
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
                    <IconButton onClick={() => setBasketOpen(false)} sx={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        height: '48px',
                        width: '48px',
                    }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{
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
                                priceLimit={account.balance - basketPrice}
                                servingCount={servingCount}
                                loading={loading}
                            />
                        ))}
                    </Stack>
                    <Box m={2}>
                        {Array.from(basket.values()).map((productWithQty) => (
                            Object.entries(productWithQty.sizeWithQuantities).map(([size, quantity]) =>
                                (quantity > 0 && <OrderItemLine productWithQty={productWithQty} quantity={quantity} size={size} /> ))))
                        }
                        {Array.from(basket.values()).length === 0 ? (
                            <Typography variant='h3'>
                                Votre panier est vide.
                            </Typography>
                        ) : (
                            <Stack mt='16px' direction="row" justifyContent={'space-between'}>
                                <Typography fontWeight='bold' variant="body1" sx={{ color: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)' }}>
                                    Total
                                </Typography>
                                <Typography variant="body2">{formatMoney(basketPrice)}</Typography>
                            </Stack>
                        )}
                    </Box>
                    <Box m={2} display="flex" justifyContent={'flex-end'}>
                        {user && user.isAdmin && (
                            <FormControlLabel
                                label="Déjà prête"
                                control={
                                    <Checkbox
                                        checked={!needPreparation}
                                        onChange={() => setNeedPreparation(!needPreparation)}
                                    />
                                }
                            />
                        )}
                        <Button
                            variant="contained"
                            onClick={() => actionCallback(needPreparation, setLoading)}
                            disabled={Array.from(basket.values()).length === 0 || loading}
                            sx={{ width: '128px', borderRadius: '10px' }}
                        >
                            {loading ? (
                                <CircularProgress sx={{ color: 'white' }} size='24.5px' />
                            ) : 'Commander'}
                        </Button>
                    </Box>
                </>
            </Box>
        </Modal>
    );
};

export default BasketModal;