import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Card, CardMedia, Checkbox, Chip, FormControlLabel, IconButton, Modal, Stack, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Product, ProductWithQty, sandwichSizeWithPrices } from '../lib/products';
import { imageLoader } from '../pages/_app';
import { useIngredients } from '../lib/firestoreHooks';
import { ingredientCarouselItems } from './lists/ingredientList';
import Image from 'next/image';
import { Ingredient, parseIngredients } from '../lib/ingredients';
import { formatMoney } from './accountDetails';

export const SandwichModal: React.FC<{
    size: string,
    modalOpen: boolean,
    setSandwichModalOpen: (b: boolean) => void,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
}> = ({ size, modalOpen, setSandwichModalOpen, basket, setBasket, priceLimit }) => {
    const [addToFavorites, setAddToFavorites] = useState(false);
    const [price, setPrice] = useState(sandwichSizeWithPrices[size]);
    const [selectedIngredients, setSelectedIngredients] = useState<Set<Ingredient>>(new Set());
    const [meatCount, setMeatCount] = useState(0);
    const ingredients = useIngredients();

    const [_isVege, setIsVege] = useState(false);
    const [_isVegan, setIsVegan] = useState(false);
    const [_allergen, setAllergen] = useState('');
    const [_description, setDescription] = useState('');

    const handleIngredient = (ingredient: Ingredient) => {
        if (selectedIngredients.has(ingredient)) {
            selectedIngredients.delete(ingredient);
            if (ingredient.category === 'meat') {
                setMeatCount(meatCount - 1);
            }
            if (ingredient.price) {
                setPrice(price - ingredient.price);
            }
        } else {
            selectedIngredients.add(ingredient);
            if (ingredient.category === 'meat') {
                setMeatCount(meatCount + 1);
            }
            if (ingredient.price) {
                setPrice(price + ingredient.price);
            }
        }

        setSelectedIngredients(new Set(selectedIngredients));
    };

    const handleAddNewSandwich = () => {
        const {isVege, isVegan, allergen, description} = parseIngredients(Array.from(selectedIngredients));
        
        const sandwich = {
            id: (Math.floor(Math.random() * (10000000))).toString(),
            type: 'serving',
            name: 'Sandwich perso',
            isAvailable: true,
            image: '/servings/custom_sandwich.jpg',
            sizeWithPrices: sandwichSizeWithPrices,
            isVege,
            isVegan,
            allergen,
            description,
            ingredients: Array.from(ingredients),
        } as Product;

        const sizeWithQuantities: Record<string, number> = {'Petit': 0, 'Normal': 0, 'Grand': 0};
        sizeWithQuantities[size] = 1;
        const basketItem = {
            product: sandwich,
            sizeWithQuantities,
        } as ProductWithQty;

        setBasket(new Map(basket.set(sandwich.id, basketItem)));
        setSandwichModalOpen(false);
        setSelectedIngredients(new Set());
        setMeatCount(0);
        setPrice(0);
    };

    useEffect(() => {
        setPrice(sandwichSizeWithPrices[size]);
        const {isVege, isVegan, allergen, description} = parseIngredients(Array.from(selectedIngredients));
        setIsVege(isVege);
        setIsVegan(isVegan);
        setAllergen(allergen);
        setDescription(description);
    }, [size, selectedIngredients]);

    return (
        <Modal
            open={modalOpen}
            sx={{
                width: '100%',
                maxWidth: '900px',
            }}
        >
            <Box sx={{
                flexGrow: 1,
                background: theme => theme.palette.background.default,
                height: '100%',
                maxHeight: '100%',
                overflow: 'auto',
                position: 'relative',
            }}>
                <>
                    <IconButton onClick={() => setSandwichModalOpen(false)} sx={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        height: '48px',
                        width: '48px',
                    }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{
                        width: '100%',
                        textAlign: 'center',
                        mt: '16px',
                    }}>
                        Mon sandwich
                    </Typography>
                    
                    {/* Shopping list */}
                    <Card sx={{
                        mt: 4,
                        mb: 2,
                        borderRadius: 0,
                        overflow: 'visible',
                        px: '32px',
                        py: '16px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Box sx={{           
                            borderRadius: '20px',
                            boxShadow: 'inset 0 2px 4px 0 hsla(0, 0%, 0%, .2)',
                            overflow: 'hidden',
                            mb: 4,
                        }}>
                            <CardMedia
                                component={'img'}
                                src={'/servings/custom_sandwich.jpg'}
                                alt={''}
                                height={128}
                            />
                        </Box>

                        <Typography variant='h4' mb={4}>
                            Sandwich {size}
                        </Typography>

                        <Typography variant='body2'>
                            Choisissez vos ingrédients :
                        </Typography>
                        {ingredientCarouselItems.map((item) => (
                            <Fragment key={item.label}>    
                                <Stack width='50%' direction="row" gap={1} sx={{ alignItems: 'center', p: 1 }}>
                                    <Typography variant="h5">
                                        {item.label}
                                    </Typography>
                                    <Image
                                        loader={imageLoader}
                                        src={item.icon}
                                        alt={''}
                                        height={36}
                                        width={36}
                                        className={'icon'}
                                    />
                                </Stack>
                                <Stack direction="row" flexWrap={'wrap'}>
                                    {ingredients.filter((ingredient) => ingredient.category === item.id).map((ingredient) => (
                                        <Stack key={ingredient.name} width='50%' direction="row" gap={1} sx={{ alignItems: 'center', p: 1 }}>
                                            <Checkbox sx={{ p: 0 }} onChange={() => handleIngredient(ingredient)} disabled={ingredient.category === 'meat' && meatCount > 0 && !selectedIngredients.has(ingredient)} />
                                            <Typography variant="body1">
                                                {ingredient.name}
                                            </Typography>
                                            {ingredient.price > 0 && <Typography variant="body2">+{formatMoney(ingredient.price)}</Typography>}
                                            {ingredient.image && (
                                                <Image
                                                    loader={imageLoader}
                                                    src={ingredient.image}
                                                    alt={ingredient.image}
                                                    height={36}
                                                    width={36}
                                                    className={'icon'}
                                                />
                                            )}
                                        </Stack>
                                    ))}
                                </Stack>    
                            </Fragment>
                        ))}

                        <Box display="flex" justifyContent="space-between" flexDirection={'row'} my={3}>
                            <Typography variant="h5">
                                Total
                            </Typography>
                            <Typography variant="body1" sx={{ fontStyle: 'italic'}}>
                                {formatMoney(price)}
                            </Typography>
                        </Box>                        

                        <Stack direction='row' gap={1}>
                            {_allergen  && (
                                <Chip
                                    variant='outlined'
                                    color={'warning'}
                                    label={_allergen}
                                    sx={{
                                        fontSize: '8px',
                                        fontWeight: 700,
                                        height: '24px',
                                    }}
                                />
                            )}

                            {/* Vege and vegan info */}
                            {_isVegan ? (
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
                            ) : _isVege && (
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
                        </Stack>
                    </Card>

                    <Box m={2} display="flex" justifyContent={'flex-end'}>
                        {/* <FormControlLabel
                            label="Ajouter aux favoris"
                            control={
                                <Checkbox
                                    checked={addToFavorites}
                                    onChange={() => setAddToFavorites(!addToFavorites)}
                                />
                            }
                        /> */}
                        <Button
                            variant="contained"
                            onClick={handleAddNewSandwich}
                            disabled={price > priceLimit}
                            sx={{ width: '170px', borderRadius: '20px' }}
                        >
                            {'Ajouter au panier'}
                        </Button>
                    </Box>
                </>
            </Box>
        </Modal>
    );
};