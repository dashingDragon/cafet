import { AddBox, ChevronRight, IndeterminateCheckBox } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { computeTotalPrice, useProducts } from '../lib/firestoreHooks';
import { Product, ProductWithQty } from '../lib/product';
import { formatMoney } from './accountDetails';
import { typeTranslation } from './productList';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';

const StyledCard: React.FC<{
  product: Product,
  selectedProductsWithQty: Map<string, ProductWithQty>,
  setSelectedProductsWithQty: (m: Map<string, ProductWithQty>) => void,
  disabled: boolean,
}> = ({ product, selectedProductsWithQty, setSelectedProductsWithQty, disabled }) => {
    const [quantity, setQuantity] = useState(0);
    const [canAdd, setCanAdd] = useState(false);

    useEffect(() => {
        setCanAdd(product.stock !== undefined ? product.isAvailable && product.stock > 0 && product.stock - quantity > 0 : product.isAvailable);
    }, [product.isAvailable, product.stock, quantity]);

    const addQuantity = () => {
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

    const isOutOfStock = product.stock === 0;

    const isReallyAvailable = product.isAvailable && !isOutOfStock;

    return (
        <Card key={product.name} sx={{
            width: 350,
            position: 'relative',
        }}>
            <CardHeader
                title={product.name}
                subheader={formatMoney(product.price)}
                sx={(theme) => ({
                    '.MuiCardHeader-title': {
                        color: theme.colors.main,
                    },
                })}
            />
            <Box sx={{
                ...(!isReallyAvailable && {
                    position: 'relative',
                    '::after': {
                        position: 'absolute',
                        content: '""',
                        display: 'block',
                        background: 'hsla(0, 0%, 0%, 0.5)',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '200px',
                    },
                }),
            }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={`Image de ${product.name}`}
                    sx={{
                        position: 'relative',
                    }}

                />
            </Box>


            <CardContent>
                {product.description !== undefined && (
                    <Typography variant="body1">
                        {product.description}
                    </Typography>
                )}

                <Chip
                    variant='outlined'
                    color={product.stock
                        ? 'success'
                        : isOutOfStock
                            ? 'error'
                            : product.isAvailable
                                ? 'success'
                                : 'error'
                    }
                    label={product.stock ? (
                        `${product.stock} restant${product.stock > 1 && 's'}`
                    ) : isOutOfStock ? (
                        'Stock épuisé'
                    ) : product.isAvailable ? (
                        'Disponible'
                    ) : (
                        'Indisponible'
                    )}
                    sx={{
                        fontWeight: 700,
                        mt: '16px',
                    }}
                />
            </CardContent>

            {/* Add and remove buttons */}
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton onClick={removeQuantity} disabled={!product.isAvailable || !quantity}>
                    <IndeterminateCheckBox />
                </IconButton>
                <span>{quantity}</span>
                <IconButton onClick={addQuantity} disabled={!canAdd || disabled}>
                    <AddBox />
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
                <React.Fragment key={type}>
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
                </React.Fragment>
            ))}
        </>
    );
};

const PayForm: React.FC<{ account: Account }> = ({ account }) => {
    const router = useRouter();
    const products = useProducts();
    const makeTransaction = useMakeTransaction();

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
            const payload = {account: account, productsWithQty: Array.from(selectedProductsWithQty.values()).filter((s) => s.quantity)};
            console.log(payload);
            const result = await makeTransaction(payload);
            // if (result?.success) {
            router.push(`/accounts/${account.id}`);
            // }

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
                    variant="contained"
                    fullWidth
                    sx={{ textTransform: 'none', mb: '16px' }}
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
