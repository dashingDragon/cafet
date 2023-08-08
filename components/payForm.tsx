import { AddCircle, ChevronRight, RemoveCircle } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { useProducts, computeTotalPrice, usePayTransactionMaker } from '../lib/firestoreHooks';
import { Product, ProductWithQty } from '../lib/product';
import { formatMoney } from './accountDetails';
import { typeTranslation } from './productList';
import { grey } from '@mui/material/colors';

const StyledCard: React.FC<{
  product: Product,
  selectedProductsWithQty: Map<string, ProductWithQty>,
  setSelectedProductsWithQty: (m: Map<string, ProductWithQty>) => void,
  disabled: boolean,
}> = ({ product, selectedProductsWithQty, setSelectedProductsWithQty, disabled }) => {
    const [quantity, setQuantity] = useState(0);

    const canAdd = (!product.isAvailable || (product.stock ? product.stock - quantity <= 0 : false));

    const addQuantity = () => { // TODO make a function for this, user checks do not suffise
        setQuantity(quantity + 1);
        const productWithQty = selectedProductsWithQty.get(product.id);
        if (productWithQty) {
            setSelectedProductsWithQty(new Map(selectedProductsWithQty.set(product.id, {
                product: productWithQty.product,
                quantity: productWithQty.quantity + 1,
            } as ProductWithQty)));
        }
    };

    const removeQuantity = () => {
        if (quantity) {
            setQuantity(quantity - 1);
            const productWithQty = selectedProductsWithQty.get(product.id);
            if (productWithQty) {
                setSelectedProductsWithQty(new Map(selectedProductsWithQty.set(product.id, {
                    product: productWithQty.product,
                    quantity: productWithQty.quantity - 1,
                } as ProductWithQty)));
            }
        }
    };

    return (
        <Card key={product.name} sx={{
            width: 350,
            position: 'relative',
        }}>
            <Box sx={{
                ...((!product.isAvailable || !product.stock) && {
                    '&:before': {
                        position: 'absolute',
                        content: '\'\'',
                        display: 'block',
                        background: 'hsla(0, 0%, 0%, 0.5)',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '140px',

                    },
                    '&:after': {
                        position: 'absolute',
                        content: !product.stock ? '"Stock épuisé"' : '"Indisponible"',
                        display: 'block',
                        color: 'white',
                        top: 20,
                        left: 20,
                    },
                }),
            }}>
                <CardMedia
                    component="img"
                    alt={`Image de ${product.name}`}
                    height="140"
                    image={product.image}
                />
            </Box>


            <CardContent>
                <Stack
                    direction={'row'}
                    justifyContent={'space-between'}
                >
                    {/* Name */}
                    <Typography gutterBottom variant="h5" component="div">
                        {product.name}
                    </Typography>

                    {/* Price */}
                    <Chip label={formatMoney(product.price)} />
                </Stack>

                {product.type !== 'serving' && (
                    // Stock
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={(theme) => ({
                            color: product.stock
                                ? theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300]
                                : theme.palette.mode === 'light' ? 'hsla(357, 100%, 50%, 1)' : 'hsla(350, 67%, 56%, 1)',
                        })}
                    >
                        {product.stock ? `${product.stock} restant${product.stock > 1 && 's'} en stock` : 'Stock épuisé'}
                    </Typography>
                )}

                {/* Description */}
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>
            </CardContent>

            {/* Add and remove buttons */}
            <CardActions>
                <IconButton onClick={removeQuantity} disabled={!product.isAvailable || !quantity}>
                    <RemoveCircle />
                </IconButton>
                <span>{quantity}</span>
                <IconButton onClick={addQuantity} disabled={!canAdd || disabled}>
                    <AddCircle />
                </IconButton>
            </CardActions>
        </Card>
    );
};

const ProductList: React.FC<{
  selectedProductsWithQty: Map<string, ProductWithQty>,
  setSelectedProductsWithQty: (m: Map<string, ProductWithQty>) => void,
  limit: number
}> = ({ selectedProductsWithQty, setSelectedProductsWithQty, limit }) => {
    const products = useProducts();

    return (
        <>
            {['serving', 'drink', 'snack'].map((type) => (
                <>
                    <Typography variant="h5" mb={2}>{typeTranslation[type]}</Typography>
                    <Stack
                        direction={'row'}
                        justifyContent={'center'}
                        flexWrap={'wrap'}
                        gap={4}
                        mb={5}
                    >
                        {products.filter(p => p.type === type).map((product) => (
                            <StyledCard
                                key={product.name}
                                product={product}
                                selectedProductsWithQty={selectedProductsWithQty}
                                setSelectedProductsWithQty={setSelectedProductsWithQty}
                                disabled={product.price > limit}
                            />
                        ))}
                    </Stack>
                </>
            ))}
        </>
    );
};

const PayForm: React.FC<{ account: Account }> = ({ account }) => {
    const router = useRouter();
    const products = useProducts();
    const makePayTransaction = usePayTransactionMaker();

    // State
    const [selectedProductsWithQty, setSelectedProductsWithQty] = useState(new Map<string, ProductWithQty>());
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const _selectedProductsWithQty = new Map();
        products.forEach((s) => {
            _selectedProductsWithQty.set(s.id, { product: s, quantity: 0 });
        });
        setSelectedProductsWithQty(_selectedProductsWithQty);
    }, [products]);

    useEffect(() => {
        let priceProducts = 0;

        for (const productWithQty of selectedProductsWithQty.values()) {
            priceProducts += computeTotalPrice(productWithQty.product, productWithQty.quantity);
        }

        setTotal(priceProducts);
    }, [selectedProductsWithQty]);

    // Compute money stuff
    const canBeCompleted = () => {
        return total <= account.balance;
    };

    const handlePay = async () => {
        if (selectedProductsWithQty.values().next()) {
            await makePayTransaction(account, Array.from(selectedProductsWithQty.values()).filter((s) => s.quantity));
            router.push(`/accounts/${account.id}`);
        }
    };

    return (
        <>
            <Box m={1}>
                <ProductList selectedProductsWithQty={selectedProductsWithQty} setSelectedProductsWithQty={setSelectedProductsWithQty} limit={account.balance - total} />
            </Box>
            <Box m={1}>
                <Button
                    disabled={!canBeCompleted()}
                    onClick={handlePay}
                    color="info"
                    variant="contained"
                    fullWidth
                    sx={{ textTransform: 'none' }}
                >
                    <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Total: {formatMoney(total)}</Typography>
                        <ChevronRight fontSize="large" />
                    </Box>
                </Button>
            </Box>
        </>
    );
};

export default PayForm;
