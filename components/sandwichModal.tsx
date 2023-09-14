import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Card, CardMedia, Checkbox, FormControlLabel, IconButton, Modal, Stack, Typography } from '@mui/material';
import { Fragment, useState } from 'react';
import { ProductWithQty, sandwichSizeWithPrices } from '../lib/products';
import { imageLoader } from '../pages/_app';
import { useIngredients } from '../lib/firestoreHooks';
import { ingredientCarouselItems } from './lists/ingredientList';
import Image from 'next/image';
import { Ingredient } from '../lib/ingredients';

export const SandwichModal: React.FC<{
    size: string,
    modalOpen: boolean,
    setSandwichModalOpen: (b: boolean) => void,
    setBasket: (m: Map<string, ProductWithQty>) => void,
    priceLimit: number,
}> = ({ size, modalOpen, setSandwichModalOpen, setBasket, priceLimit }) => {
    const [addToFavorites, setAddToFavorites] = useState(false);
    const [price, setPrice] = useState(sandwichSizeWithPrices[size]);
    const [selectedIngredients, setSelectedIngredients] = useState<Set<Ingredient>>(new Set());
    const ingredients = useIngredients();

    const handleIngredient = (ingredient: Ingredient) => {
        if (selectedIngredients.has(ingredient)) {
            selectedIngredients.delete(ingredient);
        } else {
            selectedIngredients.add(ingredient);
        }
    };

    const handleAddNewSandwich = () => {

    };

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
                        
                        <Typography variant='body1'>
                            Choisissez vos ingrédients
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
                                            <Checkbox sx={{ p: 0 }} onChange={() => handleIngredient(ingredient)} />
                                            <Typography variant="body1">
                                                {ingredient.name}
                                            </Typography>
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
                    </Card>

                    <Box m={2} display="flex" justifyContent={'flex-end'}>
                        <FormControlLabel
                            label="Ajouter aux favoris"
                            control={
                                <Checkbox
                                    checked={addToFavorites}
                                    onChange={() => setAddToFavorites(!addToFavorites)}
                                />
                            }
                        />
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