import { Add, Clear, Remove } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardMedia, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { ProductWithQty } from '../../lib/products';
import React, { useEffect, useState } from 'react';
import { getIngredientPrice } from '../../lib/ingredients';
import { formatMoney } from '../accountDetails';
import { imageLoader } from '../../pages/_app';
import Image from 'next/image';
import { useProducts } from '../../lib/firestoreHooks';
import { TransactionOrder } from '../../lib/transactions';
import logger from '../../lib/logger';

const MiniProductCard: React.FC<{
    productWithQty: ProductWithQty,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    servingCount: number,
    loading: boolean,
    order?: TransactionOrder,
}> = ({ productWithQty, basket, setBasket, priceLimit, servingCount, loading, order }) => {
    const theme = useTheme();
    const product = productWithQty.product;
    const products = useProducts();
    let stockReserved = 0;
    if (order) {
        stockReserved = Object.values(order.productsWithQty.filter(p => p.product.id === product.id)[0].sizeWithQuantities).reduce((a, b) => a + b);
    }
    const [productStock, setProductStock] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (products.length && product.stock) {
            const productInDb = products.filter(p => p.id === product.id)[0];
            setProductStock(productInDb.stock
                ? productInDb.stock + stockReserved
                : undefined);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

    const addQuantity = (size: string) => {
        logger.log('add quantity');
        const basketItem = basket.get(product.id);
        if (basketItem) {
            basketItem.sizeWithQuantities[size] = basketItem.sizeWithQuantities[size] + 1,
            setBasket(new Map(basket.set(basketItem.product.id, basketItem)));
        }
    };

    const removeQuantity = (size: string) => {
        logger.log('remove quantity');
        const basketItem = basket.get(product.id);
        if (basketItem) {
            basketItem.sizeWithQuantities[size] = basketItem.sizeWithQuantities[size] - 1,
            setBasket(new Map(basket.set(basketItem.product.id, basketItem)));
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteBasketItem = async () => {
        basket.delete(product.id);
        setBasket(new Map(basket));
        setDeleteDialogOpen(false);
    };

    const handleOpenDeleteDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDeleteDialogOpen(true);
    };

    return (
        <Stack direction="row" spacing={'16px'}>
            <Box sx={{
                height: '96px',
                width: '96px',
                borderRadius: '20px',
                overflow: 'hidden',
            }}>
                <CardMedia
                    component="img"
                    height="96"
                    image={product.image}
                    alt={`Image de ${product.name}`}
                />
            </Box>
            <Stack direction="column" flexGrow='1'>
                {/* Title and clear icon */}
                <Stack direction="row" width='100%' alignItems={'center'}>
                    <Typography variant="h5">
                        {product.name}
                    </Typography>
                    {(product.isVege || product.isVegan) && product.type === 'serving' && (
                        <Image
                            loader={imageLoader}
                            src={'../../png/leaf.png'}
                            alt={'Vege'}
                            height={18}
                            width={18}
                            className={'icon'}
                        />
                    )}
                    <IconButton onClick={handleOpenDeleteDialog} sx={{ marginLeft: 'auto' }}>
                        <Clear fontSize='small' />
                    </IconButton>
                </Stack>

                {/* Sizes and quantities */}
                {Object.entries(product.sizeWithPrices).map(([size, price]) => (
                    <Stack direction="row" m={'8px'} key={size} justifyContent={'space-between'} alignItems={'center'} width="100%">
                        <Typography variant="body2">
                            {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))}</strong>
                        </Typography>
                        <ButtonGroup variant={theme.palette.mode === 'light' ? 'outlined' : 'contained'} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                            <Button
                                sx={{ borderRadius: '20px', padding: '4px 12px' }}
                                onClick={() => removeQuantity(size)}
                                disabled={!product.isAvailable || !productWithQty.sizeWithQuantities[size] || loading}
                                title="Retirer du panier"
                            >
                                <Remove fontSize='small' />
                            </Button>
                            <Button sx={{ '&:hover': { cursor: 'auto' }, padding: '4px 12px', fontSize: '12px', width: '45px' }}>
                                {productWithQty.sizeWithQuantities[size]}
                            </Button>
                            <Button
                                sx={{ borderRadius: '20px', padding: '4px 12px' }}
                                onClick={() => addQuantity(size)}
                                title="Ajouter au panier"
                                disabled={
                                    price > priceLimit
                                    || (productStock !== undefined && productWithQty.sizeWithQuantities[size] >= productStock)
                                    || (product.type === 'serving' && servingCount >= 2)
                                    || loading
                                }
                            >
                                <Add fontSize='small'  />
                            </Button>
                        </ButtonGroup>
                    </Stack>
                ))}
            </Stack>
            {/* Delete ingredient dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>
                    {'Êtes-vous sûr de vouloir supprimer produit du panier ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={handleDeleteBasketItem} color="error" variant="contained" sx={{ color: 'white' }}>Oui</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default MiniProductCard;