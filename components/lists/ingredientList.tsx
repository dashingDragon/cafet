import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogTitle, IconButton,  Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useIngredientDeleter } from '../../lib/firestoreHooks';
import { Ingredient } from '../../lib/ingredients';
import { formatMoney } from '../accountDetails';
import Image from 'next/image';
import { imageLoader } from '../../pages/_app';
import { Carousel, CarouselItem } from '../carousel';

const carouselItems = [
    {
        label: 'Viandes',
        icon: '/png/meat.png',
    },
    {
        label: 'Fromages',
        icon: '/png/cheese.png',
    },
    {
        label: 'Légumes',
        icon: '/png/lettuce.png',
    },
    {
        label: 'Sauces',
        icon: '/png/sauce.png',
    },
    {
        label: 'Épices',
        icon: '/png/spice.png',
    },
] as CarouselItem[];

export const categoryTranslation: Record<string, string> = {
    'meat': 'Viandes/Poisson',
    'cheese': 'Fromage',
    'veggie': 'Légumes',
    'spice': 'Épices',
    'sauce': 'Sauce',
    'bread': 'Pains',
};

const IngredientItem: React.FC<{
    ingredient: Ingredient,
    setIngredientDialogOpen: (b: boolean) => void;
    setIngredient: (i: Ingredient) => void;
}> = ({ ingredient, setIngredientDialogOpen, setIngredient }) => {
    const deleteIngredient = useIngredientDeleter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteIngredient = async () => {
        await deleteIngredient(ingredient);
        setDeleteDialogOpen(false);
    };

    const handleOpenDeleteDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleOpenIngredientDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIngredient(ingredient);
        setIngredientDialogOpen(true);
    };

    const hasContents = (ingredient.allergen || ingredient.isVegan || ingredient.isVege);

    return (
        <>
            <Card variant={'elevation'} sx={{
                width: 200,
                position: 'relative',
                borderRadius: '20px',
            }}>
                <CardHeader
                    title={
                        <>
                            {ingredient.name}
                            {(ingredient.isVege || ingredient.isVegan) && (
                                <Image
                                    loader={imageLoader}
                                    src={'png/leaf.png'}
                                    alt={'Vege'}
                                    height={18}
                                    width={18}
                                    className={'icon'}
                                />
                            )}


                        </>}
                    subheader={ingredient.price ? <strong>+{formatMoney(ingredient.price)}</strong> : ''}
                    sx={(theme) => ({
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

                {hasContents && (
                    <CardContent sx={{ py: 0 }}>
                        {ingredient.allergen  && (
                            <Chip
                                variant='outlined'
                                color={'warning'}
                                label={ingredient.allergen}
                                sx={{
                                    fontSize: '8px',
                                    fontWeight: 700,
                                    height: '24px',
                                }}
                            />
                        )}
                        {ingredient.isVegan ? (
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
                        ) : ingredient.isVege && (
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
                    </CardContent>
                )}

                <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
                    <IconButton>
                        <EditOutlined
                            onClick={handleOpenIngredientDialog}
                            fontSize='small'
                            sx={(theme) => ({
                                color: theme.colors.main,
                            })} />
                    </IconButton>

                    <IconButton>
                        <DeleteOutlined
                            onClick={handleOpenDeleteDialog}
                            fontSize='small'
                            sx={(theme) => ({
                                color: theme.colors.main,
                            })} />
                    </IconButton>
                </CardActions>
            </Card>

            {/* Delete ingredient dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>
                    {'Êtes-vous sûr de vouloir supprimer cet ingrédient ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={handleDeleteIngredient} color="error" variant="contained" sx={{ color: 'white' }}>Oui</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const IngredientList: React.FC<{
  ingredients: Ingredient[],
  setIngredientDialogOpen: (b: boolean) => void;
  setIngredient: (i: Ingredient) => void;
}> = ({ ingredients, setIngredientDialogOpen, setIngredient }) => {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box m={'16px'}>
            <Carousel carouselItems={carouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
            <Stack
                direction={'row'}
                justifyContent={'flex-start'}
                sx={{
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    '&-ms-overflow-style:': {
                        display: 'none',
                    },
                }}
                gap={2}
                mt={2}
                mb={4}
            >
                {ingredients.filter(p => p.category === Object.keys(categoryTranslation)[tabIndex]).map((ingredient) =>
                    <Box key={ingredient.id} mb={'16px'}>
                        <IngredientItem ingredient={ingredient} setIngredientDialogOpen={setIngredientDialogOpen} setIngredient={setIngredient} />
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default IngredientList;
