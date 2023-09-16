import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Card, CardMedia, Checkbox, Chip, FormControlLabel, IconButton, Menu, MenuItem, Modal, Stack, TextField, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Product, ProductWithQty, sandwichSizeWithPrices } from '../lib/products';
import { imageLoader } from '../pages/_app';
import { useIngredients, useProducts } from '../lib/firestoreHooks';
import { ingredientCarouselItems } from './lists/ingredientList';
import Image from 'next/image';
import { Ingredient, parseIngredients } from '../lib/ingredients';
import { formatMoney } from './accountDetails';

export const SandwichModal: React.FC<{
    size: string,
    modalOpen: boolean,
    favorites: Set<string>,
    setFavorites: (s: Set<string>) => void,
    setSandwichModalOpen: (b: boolean) => void,
    basket: Map<string, ProductWithQty>,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
}> = ({ size, modalOpen, favorites, setFavorites, setSandwichModalOpen, basket, setBasket, priceLimit }) => {
    const [addToFavorites, setAddToFavorites] = useState(false);
    const [price, setPrice] = useState(sandwichSizeWithPrices[size]);
    const [selectedIngredientsIds, setSelectedIngredientsIds] = useState<Set<string>>(new Set());
    const [meatCount, setMeatCount] = useState(0);
    const ingredients = useIngredients();
    const products = useProducts();

    const [sandwiches, setSandwiches] = useState<Map<string, Product>>(new Map());

    const [_isVege, setIsVege] = useState(false);
    const [_isVegan, setIsVegan] = useState(false);
    const [_allergen, setAllergen] = useState('');
    const [_description, setDescription] = useState('');

    const [name, setName] = useState('');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleIngredient = (ingredient: Ingredient) => {
        if (selectedIngredientsIds.has(ingredient.id)) {
            selectedIngredientsIds.delete(ingredient.id);
            if (ingredient.category === 'meat') {
                setMeatCount(meatCount - 1);
            }
            if (ingredient.price) {
                setPrice(price - ingredient.price);
            }
        } else {
            selectedIngredientsIds.add(ingredient.id);
            if (ingredient.category === 'meat') {
                setMeatCount(meatCount + 1);
            }
            if (ingredient.price) {
                setPrice(price + ingredient.price);
            }
        }

        setSelectedIngredientsIds(new Set(selectedIngredientsIds));
    };

    const handleAddNewSandwich = () => {
        const selectedIngredients = [] as Ingredient[];
        ingredients.forEach((ingredient) => {
            if (selectedIngredientsIds.has(ingredient.id)) {
                selectedIngredients.push(ingredient);
            }
        });
        const {isVege, isVegan, allergen, description} = parseIngredients(selectedIngredients);
        
        const sandwich = {
            id: (Math.floor(Math.random() * (10000000))).toString(),
            type: 'serving',
            name: name ?? 'Sandwich perso',
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

        if (addToFavorites && name) {
            if (favorites.has(name)) {
                favorites.delete(name);
            } else {
                favorites.add(name);
            }
            setFavorites(new Set(favorites));
        }

        setSandwichModalOpen(false);
        setSelectedIngredientsIds(new Set());
        setMeatCount(0);
        setPrice(0);
    };

    const chooseSandwichTemplate = (sandwich: Product) => {
        if (sandwich && sandwich.ingredients) {
            selectedIngredientsIds.clear();
            sandwich.ingredients.forEach((ingredient) => {
                selectedIngredientsIds.add(ingredient.id);
            });
            setSelectedIngredientsIds(new Set(selectedIngredientsIds));
        };
        handleCloseMenu();
    };

    useEffect(() => {
        let newMeatCount = 0;
        setPrice(sandwichSizeWithPrices[size]);
        const selectedIngredients = [] as Ingredient[];
        ingredients.forEach((ingredient) => {
            if (selectedIngredientsIds.has(ingredient.id)) {
                selectedIngredients.push(ingredient);
                if (ingredient.category === 'meat') {
                    newMeatCount++;
                }
            }
        });
        const {isVege, isVegan, allergen, description} = parseIngredients(selectedIngredients);
        setIsVege(isVege);
        setIsVegan(isVegan);
        setAllergen(allergen);
        setDescription(description);
        setMeatCount(newMeatCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, selectedIngredientsIds]);

    useEffect(() => {
        products.forEach((product) => {
            if (product.name.includes('Sandwich')) {
                sandwiches.set(product.id, product);
            }
        });
        setSandwiches(new Map(sandwiches));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

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

                        {/* Size Menu */}
                        <Button onClick={handleOpenMenu} variant="contained" sx={{ width: '150px'}}>
                            Présélections
                        </Button>
                        
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleCloseMenu}
                        >
                            {Array.from(sandwiches.values()).map((product) => (
                                <MenuItem key={product.id} onClick={() => chooseSandwichTemplate(product)} disabled={price > priceLimit}>
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
                                </MenuItem>
                            ))}
                        </Menu>

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
                                            <Checkbox
                                                sx={{ p: 0 }}
                                                checked={selectedIngredientsIds.has(ingredient.id)}
                                                onChange={() => handleIngredient(ingredient)}
                                                disabled={ingredient.category === 'meat' && meatCount > 0 && !selectedIngredientsIds.has(ingredient.id)}
                                            />
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

                    <Stack m={2} justifyContent={'flex-end'} flexWrap={'wrap-reverse'}>
                        {/* <FormControlLabel
                            label="Ajouter aux favoris"
                            control={
                                <Checkbox
                                    checked={addToFavorites}
                                    onChange={() => setAddToFavorites(!addToFavorites)}
                                />
                            }
                        />
                        {addToFavorites && (
                            <TextField
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nom du favori"
                                variant="outlined"
                                fullWidth
                                sx={{ my: 1 }}
                                helperText={'Si ce nom existe déjà, l\'ancien favori sera écrasé'}
                            />
                        )} */}
                        <Button
                            variant="contained"
                            onClick={handleAddNewSandwich}
                            disabled={price > priceLimit || (addToFavorites && !name)}
                            sx={{ minWidth: '170px', width: '170px', borderRadius: '20px' }}
                        >
                            {'Ajouter au panier'}
                        </Button>
                    </Stack>
                </>
            </Box>
        </Modal>
    );
};