import { Add, FileCopy, Print, Save, Share } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Menu, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getIngredientPrice } from '../lib/ingredients';
import { Product, ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';

export const ShortProductCard: React.FC<{
    product: Product,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    disabled: boolean,
}> = ({ product, basket, setBasket, disabled }) => {
    const [quantity, setQuantity] = useState(0);
    const [canAdd, setCanAdd] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const addToBasket = (chosenSize: string) => {
        if (!product.sizeWithPrices) return;
        var basketItem = basket.get(product.id);
        if (basketItem) {
            basketItem.sizeWithQuantities[chosenSize] += 1;
            setBasket(new Map(basket.set(product.id, basketItem)));
            // TODO snackbar to notify user
        } else {
            const sizeWithQuantities: Record<string, number> = {};
            for (const size of Object.keys(product.sizeWithPrices)) {
                sizeWithQuantities[size] = size === chosenSize ? 1 : 0;
            }
            basketItem = {
                product: product,
                sizeWithQuantities: sizeWithQuantities,
            } as ProductWithQty;
            setBasket(new Map(basket.set(product.id, basketItem)));
        }
        handleCloseMenu();
    };

    useEffect(() => {
        setCanAdd(product.stock !== undefined ? product.isAvailable && product.stock > 0 && product.stock - quantity > 0 : product.isAvailable);
    }, [product.isAvailable, product.stock, quantity]);


    const isOutOfStock = product.stock === 0;

    const isReallyAvailable = product.isAvailable && !isOutOfStock;

    return (
        <Card key={product.name} sx={{
            width: 350,
            position: 'relative',
            borderRadius: '20px',
        }}>

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
            <CardHeader
                title={product.name}
                subheader={
                    product.sizeWithPrices
                        ? Object.entries(product.sizeWithPrices)
                            .map(([size, price], i) => (
                                <span key={size}>
                                    {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))} {i < Object.entries(product.sizeWithPrices).length - 1 && ' · '}</strong>
                                </span>
                            ))
                        : ''
                }
                sx={(theme) => ({
                    px: '24px',
                    pt: '8px',
                    '.MuiCardHeader-title': {
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />

            <CardContent sx={{ px: '24px', pt: '8px' }} >
                {product.description !== undefined && (
                    <Typography variant="body1">
                        {product.description}
                    </Typography>
                )}


            </CardContent>

            {/* Add and remove buttons */}
            <CardActions sx={{
                justifyContent: 'flex-start',
                maxWidth: '100%',
                flexWrap: 'wrap',
                spacing: 0,
                px: '24px',
                paddingRight: '8px',
                '& > :not(:first-of-type)': {
                    // TODO
                },
            }}>
                {product.allergen  && (
                    <Chip
                        variant='outlined'
                        color={'warning'}
                        label={product.allergen}
                        sx={{
                            fontSize: '10px',
                            fontWeight: 700,
                        }}
                    />
                )}
                {product.isVegan ? (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végan'}
                        sx={{
                            fontSize: '10px',
                            fontWeight: 700,
                        }}
                    />
                ) : product.isVege && (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végé'}
                        sx={{
                            fontSize: '10px',
                            fontWeight: 700,
                        }}
                    />
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
                        fontSize: '10px',
                        fontWeight: 700,
                    }}
                />
                <IconButton sx={{
                    background: theme => theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 43%, 1)',
                    color: 'white',
                    ml: 'auto',
                }} onClick={handleOpenMenu}>
                    <Add />
                </IconButton>
                <Menu
                    id="add-size-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseMenu}
                >
                    {product.sizeWithPrices ? Object.entries(product.sizeWithPrices).map(([size, price]) =>
                        <MenuItem key={size} onClick={() => addToBasket(size)}>
                            {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))}</strong>
                        </MenuItem>
                    ) : null}
                </Menu>
            </CardActions>
        </Card>
    );
};