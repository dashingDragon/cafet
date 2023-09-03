import { Add, FavoriteBorderOutlined, FavoriteOutlined } from '@mui/icons-material';
import { AlertColor, Box, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { getIngredientPrice } from '../../lib/ingredients';
import { Product, ProductWithQty } from '../../lib/products';
import { formatMoney } from './../accountDetails';
import { imageLoader } from '../../pages/_app';
import Image from 'next/image';
import { useSetFavorites } from '../../lib/firebaseFunctionHooks';

export const ShortProductCard: React.FC<{
    product: Product,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    servingCount: number,
    setSnackbarMessage: (message: string, severity: AlertColor) => void,
    favorites: Set<string>,
    setFavorites: (s: Set<string>) => void,
}> = ({ product, basket, setBasket, priceLimit, servingCount, setSnackbarMessage, favorites, setFavorites }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const basketItem = basket.get(product.id);
    const basketQuantity = basketItem !== undefined ? Object.values(basketItem.sizeWithQuantities).reduce((a, b) => a + b) : 0;
    const enoughStock = product.stock !== undefined ? product.stock - basketQuantity > 0 : true;
    const isReallyAvailable = product.isAvailable && enoughStock;

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
        setSnackbarMessage(`${product.name}: ${chosenSize} a été ajouté au panier.`, 'success');
        handleCloseMenu();
    };

    const handleChangeFavorite = () => {
        if (favorites.has(product.id)) {
            favorites.delete(product.id);
        } else {
            favorites.add(product.id);
        }
        setFavorites(new Set(favorites));
    };

    return (
        <Card variant={isReallyAvailable ? 'elevation' : 'outlined'} sx={{
            width: 200,
            minWidth: 200,
            position: 'relative',
            borderRadius: '20px',
        }}>

            {/* Image */}
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
                        height: '100px',
                    },
                }),
            }}>
                <CardMedia
                    component="img"
                    height="100"
                    image={product.image}
                    alt={`Image de ${product.name}`}
                    sx={{
                        position: 'relative',
                    }}
                />
            </Box>

            <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                borderBottomLeftRadius: '20px',
                background: 'hsla(0, 0%, 0%, 0.5)',
            }}>
                <IconButton onClick={handleChangeFavorite}>
                    {favorites.has(product.id) ? (
                        <FavoriteOutlined sx={{ color: 'hsla(4, 93%, 52%, 1)' }} />
                    ) : (
                        <FavoriteBorderOutlined />
                    )}
                </IconButton>
            </Box>

            {/* Name and price */}
            <CardHeader
                title={
                    <>
                        {product.name}
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
                    </>
                }
                subheader={
                    product.sizeWithPrices
                        ? Object.entries(product.sizeWithPrices)
                            .map(([size, price], i) => (
                                <span key={size}>
                                    {size}: <strong>
                                        {formatMoney(price + getIngredientPrice(product.ingredients))} {i < Object.entries(product.sizeWithPrices).length - 1 && ' · '}
                                    </strong>
                                </span>
                            ))
                        : ''
                }
                sx={(theme) => ({
                    px: '16px',
                    pt: '8px',
                    pb: 0,
                    '.MuiCardHeader-title': {
                        fontSize: '14px',
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        fontSize: '10px',
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />

            {/* Description */}
            {product.description !== undefined && (
                <CardContent sx={{ px: '16px', pt: '8px', pb: 0 }} >
                    <Typography fontSize={'10px'}>
                        {product.description}
                    </Typography>
                </CardContent>
            )}

            <CardActions sx={{
                justifyContent: 'flex-start',
                maxWidth: '100%',
                flexWrap: 'wrap',
                spacing: 0,
                px: '16px',
                gap: '8px',
                paddingRight: '16px',
                paddingBottom: '16px',
                mt: 'auto',
                '& > :not(:first-of-type)': {
                    ml: 0,
                },
            }}>
                {/* Allergen info */}
                {product.allergen  && (
                    <Chip
                        variant='outlined'
                        color={'warning'}
                        label={product.allergen}
                        sx={{
                            fontSize: '8px',
                            fontWeight: 700,
                            height: '24px',
                        }}
                    />
                )}

                {/* Vege and vegan info */}
                {product.isVegan ? (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végan'}
                        sx={{
                            fontSize: '8px',
                            fontWeight: 700,
                            height: '24px',
                        }}
                    />
                ) : product.isVege && (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végé'}
                        sx={{
                            fontSize: '8px',
                            fontWeight: 700,
                            height: '24px',
                        }}
                    />
                )}

                {/* Stock and availability */}
                <Chip
                    variant='outlined'
                    color={product.stock
                        ? 'success'
                        : !enoughStock
                            ? 'error'
                            : product.isAvailable
                                ? 'success'
                                : 'error'
                    }
                    label={product.stock ? (
                        `${product.stock} ${product.stock > 1 ? 'restants' : 'restant'}`
                    ) : !enoughStock ? (
                        'Stock épuisé'
                    ) : product.isAvailable ? (
                        'Disponible'
                    ) : (
                        'Indisponible'
                    )}
                    sx={{
                        fontSize: '8px',
                        fontWeight: 700,
                        height: '24px',
                    }}
                />

                {/* Add button */}
                <IconButton disabled={!isReallyAvailable || (product.type === 'serving' && servingCount >= 2)} sx={{
                    background: 'hsla(145, 28%, 43%, 1)',
                    color: 'white',
                    ml: 'auto',
                    width: '32px',
                    height: '32px',
                }} onClick={handleOpenMenu}>
                    <Add fontSize='small' />
                </IconButton>

                {/* Size Menu */}
                <Menu
                    id="add-size-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseMenu}
                >
                    {product.sizeWithPrices ? Object.entries(product.sizeWithPrices).map(([size, price]) =>
                        <MenuItem key={size} onClick={() => addToBasket(size)} disabled={price > priceLimit}>
                            {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))}</strong>
                        </MenuItem>
                    ) : null}
                </Menu>
            </CardActions>
        </Card>
    );
};