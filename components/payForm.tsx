import { AddBox, ChevronRight, IndeterminateCheckBox } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, CircularProgress, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Account } from '../lib/accounts';
import { useProducts } from '../lib/firestoreHooks';
import { Product, ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import { typeTranslation } from './productList';
import { useMakeTransaction } from '../lib/firebaseFunctionHooks';
import { type } from 'os';

const StyledCard: React.FC<{
  product: Product,
  selectedProductsWithQty: Map<string, ProductWithQty>,
  setSelectedProductsWithQty: (m: Map<string, ProductWithQty>) => void,
  disabled: boolean,
}> = ({ product, selectedProductsWithQty, setSelectedProductsWithQty, disabled }) => {
    const [quantity, setQuantity] = useState(0);
    const [canAdd, setCanAdd] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');

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

    const handleChangeSize = (event: SelectChangeEvent) => {
        setSelectedSize(event.target.value);
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
                subheader={formatMoney(product.sizeWithPrices[selectedSize])}
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
                {/* Size */}
                <InputLabel id="size-select-label">Type du produit :</InputLabel>
                <Select
                    labelId="size-select-label"
                    value={selectedSize}
                    onChange={handleChangeSize}
                >
                    {Object.entries(product.sizeWithPrices).map(([k, v]) =>
                        <MenuItem key={k} value={k}>
                            <Typography variant="body1">
                                {k}
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 'auto' }}>
                                {formatMoney(v)}
                            </Typography>
                        </MenuItem>
                    )}
                </Select>
                <IconButton onClick={removeQuantity} disabled={!product.isAvailable || !quantity} title="Retirer du panier">
                    <IndeterminateCheckBox />
                </IconButton>
                <span>{quantity}</span>
                <IconButton onClick={addQuantity} disabled={!canAdd || disabled} title="Ajouter au panier">
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
                                disabled={!Object.values(product.sizeWithPrices).some(value => value <= limit)}
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
    const [loading, setLoading] = useState(false);

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
            priceProducts += productWithQty.product.sizeWithPrices[productWithQty.size] * productWithQty.quantity;
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
        <>
            <Box m={'8px'} pb='64px'>
                <ProductList selectedProductsWithQty={selectedProductsWithQty} setSelectedProductsWithQty={setSelectedProductsWithQty} limit={account.balance - total} />
            </Box>
            <Box m={'8px'}>
                {total > 0 && (
                    <Button
                        disabled={!canBeCompleted()}
                        onClick={handlePay}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            bottom: '16px',
                            position: 'fixed',
                            width: 'calc(100% - 16px)',
                        }}
                    >
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" title="Payer">
                            <Typography variant="h6">Total: <strong>{formatMoney(total)}</strong></Typography>
                            {loading ? (
                                <CircularProgress sx={{ color: 'white' }}/>
                            ) : (
                                <ChevronRight fontSize="large" sx={{ height: '40px', width: '40px' }} />
                            )}
                        </Box>
                    </Button>
                )}
            </Box>
        </>
    );
};

export default PayForm;
