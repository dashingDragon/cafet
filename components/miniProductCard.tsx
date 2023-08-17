import { Add, Remove } from '@mui/icons-material';
import { Box, CardMedia, IconButton, Stack, Typography } from '@mui/material';
import { ProductWithQty } from '../lib/products';
import React, { useState } from 'react';
import { getIngredientPrice } from '../lib/ingredients';
import { formatMoney } from './accountDetails';

const MiniProductCard: React.FC<{
    productWithQty: ProductWithQty,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
}> = ({ productWithQty, basket, setBasket }) => {
    const addQuantity = (size: string) => {
        const basketItem = basket.get(productWithQty.product.id);
        if (basketItem) {
            basketItem.sizeWithQuantities[size] = basketItem.sizeWithQuantities[size] + 1,
            setBasket(new Map(basket.set(basketItem.product.id, basketItem)));
        }
    };

    // TODO
    const removeQuantity = (size: string) => {
        // if (quantity) {
        //     setQuantity(quantity - 1);
        //     const productWithQty = basket.get(product.id);
        //     if (productWithQty) {
        //         setBasket(new Map(basket.set(product.id, {
        //             product: productWithQty.product,
        //             quantity: productWithQty.quantity - 1,
        //         } as ProductWithQty)));
        //     }
        // }
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
                    image={productWithQty.product.image}
                    alt={`Image de ${productWithQty.product.name}`}
                />
            </Box>
            <Stack direction="column">
                <Typography variant="h5" >
                    {productWithQty.product.name}
                </Typography>
                {Object.entries(productWithQty.product.sizeWithPrices).map(([size, price]) => (
                    <React.Fragment key={size}>
                        <Typography>
                            {size}: <strong>{formatMoney(price + getIngredientPrice(productWithQty.product.ingredients))}</strong>
                        </Typography>
                        <Stack direction="row">
                            <IconButton onClick={() => removeQuantity(size)} disabled={!productWithQty.product.isAvailable || !productWithQty.sizeWithQuantities[size]} title="Retirer du panier">
                                <Remove />
                            </IconButton>
                            <span>{productWithQty.sizeWithQuantities[size]}</span>
                            <IconButton onClick={() => addQuantity(size)} title="Ajouter au panier">
                                <Add />
                            </IconButton>
                        </Stack>
                    </React.Fragment>
                ))}

            </Stack>
        </Stack>
    );
};

export default MiniProductCard;