import { AlertColor, Box, Card, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useFirestoreUser, useProducts } from '../../lib/firestoreHooks';
import { ProductWithQty } from '../../lib/products';
import { ShortProductCard } from '../cards/shortProductCard';
import { typeTranslation } from './productList';
import { Carousel, CarouselItem } from '../carousel';
import { useSetFavorites } from '../../lib/firebaseFunctionHooks';

const carouselItems = [
    {
        label: 'Plats',
        icon: '/png/serving.png',
    },
    {
        label: 'Boissons',
        icon: '/png/drink.png',
    },
    {
        label: 'Snacks',
        icon: '/png/snack.png',
    },
] as CarouselItem[];

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

    const updateFavorites = useSetFavorites();

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
            <Carousel carouselItems={carouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
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
                {products.filter(p => p.type === Object.keys(typeTranslation)[tabIndex]).map((product) => (
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