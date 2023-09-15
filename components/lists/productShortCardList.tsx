import { AlertColor, Box, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useFirestoreUser, useProducts } from '../../lib/firestoreHooks';
import { ProductWithQty, productCarouselItems, sandwichSizeWithPrices } from '../../lib/products';
import { ShortProductCard } from '../cards/shortProductCard';
import { Carousel } from '../carousel';
import { useSetFavorites } from '../../lib/firebaseFunctionHooks';
import { Add } from '@mui/icons-material';
import { formatMoney } from '../accountDetails';
import { SandwichModal } from '../sandwichModal';

export const ProductShortCardList: React.FC<{
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
    servingCount: number,
    setSnackbarMessage: (message: string, severity: AlertColor) => void,
}> = ({ basket, setBasket, priceLimit, servingCount, setSnackbarMessage }) => {
    const products = useProducts();
    const user = useFirestoreUser();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [tabIndex, setTabIndex] = useState(0);
    const [sandwichSize, setSandwichSize] = useState('');

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const [sandwichModalOpen, setSandwichModalOpen] = useState(false);

    const updateFavorites = useSetFavorites();

    const handleOpenBasketModal = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleCloseBasketModal = () => {
        setMenuAnchorEl(null);
    };

    const handleCustomSandwich = (size: string) => {
        setSandwichSize(size);
        setSandwichModalOpen(true);
        setMenuAnchorEl(null);
    };

    useEffect(() => {
        if (favorites.size) {
            updateFavorites({ favorites: [...favorites] });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favorites]);

    useEffect(() => {
        if (user && user.favorites && user.favorites.length) {
            setFavorites(new Set(user.favorites));
        }
    }, [user]);

    return (
        <>
            {favorites.size > 0 && (
                <Stack
                    direction={'row'}
                    justifyContent={'flex-start'}
                    sx={{
                        flexShrink: 0,
                        overflowX: 'auto',
                        marginRight: '-32px',
                        paddingRight: '32px',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        '&-ms-overflow-style:': {
                            display: 'none',
                        },
                    }}
                    gap={2}
                    mt={4}
                >
                    {products.filter(p => favorites.has(p.id)).map((product) => (
                        <ShortProductCard
                            key={product.name}
                            product={product}
                            basket={basket}
                            setBasket={setBasket}
                            priceLimit={priceLimit}
                            servingCount={servingCount}
                            setSnackbarMessage={setSnackbarMessage}
                            favorites={favorites}
                            setFavorites={setFavorites}
                        />
                    ))}
                </Stack>
            )}
            <Carousel carouselItems={productCarouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
            <Stack
                direction={'row'}
                justifyContent={'flex-start'}
                sx={{
                    flexShrink: 0,
                    overflowX: 'auto',
                    marginRight: '-32px',
                    paddingRight: '32px',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    '&-ms-overflow-style:': {
                        display: 'none',
                    },
                }}
                gap={2}
                mb={4}
            >
                {tabIndex === 0 && (
                    /* Custom sandwich card */
                    <Card variant={'elevation'} sx={{
                        width: 200,
                        minWidth: 200,
                        position: 'relative',
                        borderRadius: '20px',
                    }}>

                        {/* Image */}
                        <Box>
                            <CardMedia
                                component="img"
                                height="100"
                                image={'/servings/custom_sandwich.jpg'}
                                alt={`Image de sandwich`}
                                sx={{
                                    position: 'relative',
                                }}
                            />
                        </Box>

                        {/* Name and price */}
                        <CardHeader
                            title={'Faire mon sandwich'}
                            subheader={'Grand: 2.50 € · Normal: 2.00 € · Petit: 1.50 €' }
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
                        <CardContent sx={{ px: '16px', pt: '8px', pb: 0 }} >
                            <Typography fontSize={'10px'}>
                                Faites votre propre sandwich !
                            </Typography>
                        </CardContent>
                        
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
                            {/* Add button */}
                            <IconButton disabled={servingCount >= 2} sx={{
                                background: 'hsla(145, 28%, 43%, 1)',
                                color: 'white',
                                ml: 'auto',
                                width: '32px',
                                height: '32px',
                            }} onClick={handleOpenBasketModal}>
                                <Add fontSize='small' />
                            </IconButton>

                            {/* Size Menu */}
                            <Menu
                                id="add-size-menu"
                                anchorEl={menuAnchorEl}
                                open={menuOpen}
                                onClose={handleCloseBasketModal}
                            >
                                {sandwichSizeWithPrices ? Object.entries(sandwichSizeWithPrices).map(([size, price]) =>
                                    <MenuItem key={size} onClick={() => handleCustomSandwich(size)} disabled={price > priceLimit}>
                                        {size}: <strong>{formatMoney(price)}</strong>
                                    </MenuItem>
                                ) : null}
                            </Menu>
                        </CardActions>

                        <SandwichModal size={sandwichSize} modalOpen={sandwichModalOpen} setSandwichModalOpen={setSandwichModalOpen} basket={basket} setBasket={setBasket} priceLimit={priceLimit} />
                    </Card>
                )}
                
                {products.filter(p => p.type === productCarouselItems[tabIndex].id).map((product) => (
                    <ShortProductCard
                        key={product.name}
                        product={product}
                        basket={basket}
                        setBasket={setBasket}
                        priceLimit={priceLimit}
                        servingCount={servingCount}
                        setSnackbarMessage={setSnackbarMessage}
                        favorites={favorites}
                        setFavorites={setFavorites}
                    />
                ))}
            </Stack>
        </>
    );
};