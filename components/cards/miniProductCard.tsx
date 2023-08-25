import { Add, Clear, Remove } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardMedia, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { ProductWithQty } from '../../lib/products';
import React, { useState } from 'react';
import { getIngredientPrice } from '../../lib/ingredients';
import { formatMoney } from '../accountDetails';
import { imageLoader } from '../../pages/_app';
import Image from 'next/image';
import { useProducts } from '../../lib/firestoreHooks';

const MiniProductCard: React.FC<{
    productWithQty: ProductWithQty,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    servingCount: number,
}> = ({ productWithQty, basket, setBasket, priceLimit, servingCount }) => {
    const theme = useTheme();
    const product = productWithQty.product;
    const products = useProducts();
    const productStock = products.filter(p => p.id === productWithQty.product.id).length > 0
        ? products.filter(p => p.id === productWithQty.product.id)[0].stock
        : undefined;

    const addQuantity = (size: string) => {
        console.log('add quantity');
        const basketItem = basket.get(product.id);
        console.log(basketItem);
        if (basketItem) {
            basketItem.sizeWithQuantities[size] = basketItem.sizeWithQuantities[size] + 1,
            setBasket(new Map(basket.set(basketItem.product.id, basketItem)));
        }
    };

    const removeQuantity = (size: string) => {
        console.log('remove quantity');
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
                borderRadius: '10px',
                overflow: 'hidden',
            }}>
                <CardMedia
                    component="img"
                    height="96"
                    image={product.image}
                    alt={`Image de ${product.name}`}
                />
            </Box>
            <Stack direction="column">
                <Stack direction="row" spacing={'16px'} width='100%' justifyContent={'space-between'}>
                    <Typography variant="h5" >
                        {product.name}
                    </Typography>
                    {(product.isVege || product.isVegan) && product.type === 'serving' && (
                        <Image
                            loader={imageLoader}
                            src={'../../png/leaf.png'}
                            alt={'Vege'}
                            height={36}
                            width={36}
                            className={'icon'}
                        />
                    )}
                    <IconButton color='primary' onClick={handleOpenDeleteDialog}>
                        <Clear />
                    </IconButton>
                </Stack>

                {Object.entries(product.sizeWithPrices).map(([size, price]) => (
                    <Stack direction="row" m={'8px'} key={size} justifyContent={'space-between'} width="100%">
                        <Typography>
                            {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))}</strong>
                        </Typography>
                        <ButtonGroup variant={theme.palette.mode === 'light' ? 'outlined' : 'contained'} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
                            <Button
                                sx={{ borderRadius: '10px'}}
                                onClick={() => removeQuantity(size)}
                                disabled={!product.isAvailable || !productWithQty.sizeWithQuantities[size]}
                                title="Retirer du panier"
                            >
                                <Remove />
                            </Button>
                            <Button sx={{ '&:hover': { cursor: 'auto' }}}>
                                {productWithQty.sizeWithQuantities[size]}
                            </Button>
                            <Button
                                sx={{ borderRadius: '10px'}}
                                onClick={() => addQuantity(size)}
                                title="Ajouter au panier"
                                // TODO sync this with database
                                disabled={
                                    price > priceLimit
                                    || (productStock !== undefined && productWithQty.sizeWithQuantities[size] >= productStock)
                                    || (product.type === 'serving' && servingCount >= 2)
                                }
                            >
                                <Add />
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