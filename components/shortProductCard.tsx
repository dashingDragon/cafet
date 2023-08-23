import { Add } from '@mui/icons-material';
import { AlertColor, Box, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { getIngredientPrice } from '../lib/ingredients';
import { Product, ProductWithQty } from '../lib/products';
import { formatMoney } from './accountDetails';
import { imageLoader } from '../pages/_app';
import Image from 'next/image';

export const ShortProductCard: React.FC<{
    product: Product,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    setSnackbarMessage: (message: string, severity: AlertColor) => void,
}> = ({ product, basket, setBasket, priceLimit, setSnackbarMessage }) => {
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
            setSnackbarMessage(`${product.name}: ${chosenSize} a été ajouté au panier.`, 'success');
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

    const isOutOfStock = product.stock === 0;

    const isReallyAvailable = product.isAvailable && !isOutOfStock;

    return (
        <Card variant={isReallyAvailable ? 'elevation' : 'outlined'} sx={{
            width: 200,
            minWidth: 200,
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
                    px: '24px',
                    pt: '8px',
                    '.MuiCardHeader-title': {
                        fontSize: '16px',
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        fontSize: '12px',
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />
            {product.description !== undefined && (
                <CardContent sx={{ px: '24px', pt: '8px' }} >

                    <Typography variant="body1">
                        {product.description}
                    </Typography>
                </CardContent>
            )}

            {/* Add and remove buttons */}
            <CardActions sx={{
                justifyContent: 'flex-start',
                maxWidth: '100%',
                flexWrap: 'wrap',
                spacing: 0,
                px: '24px',
                gap: '8px',
                paddingRight: '16px',
                paddingBottom: '16px',
                mt: 'auto',
                '& > :not(:first-of-type)': {
                    ml: 0,
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
                <IconButton disabled={!isReallyAvailable} sx={{
                    background: 'hsla(145, 28%, 43%, 1)',
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
                        <MenuItem key={size} onClick={() => addToBasket(size)} disabled={price > priceLimit}>
                            {size}: <strong>{formatMoney(price + getIngredientPrice(product.ingredients))}</strong>
                        </MenuItem>
                    ) : null}
                </Menu>
            </CardActions>
        </Card>
    );
};