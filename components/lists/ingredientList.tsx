import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogTitle, IconButton,  Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useIngredientDeleter } from '../../lib/firestoreHooks';
import { Ingredient } from '../../lib/ingredients';
import { formatMoney } from '../accountDetails';
import Image from 'next/image';
import { imageLoader } from '../../pages/_app';
import { Carousel } from '../carousel';
import { CarouselItem } from '../../lib/products';

export const ingredientCarouselItems = [
    {
        id: 'meat',
        label: 'Viandes/Poisson',
        icon: '/png/meat.png',
    },
    {
        id: 'cheese',
        label: 'Fromages',
        icon: '/png/cheese.png',
    },
    {
        id: 'veggie',
        label: 'Légumes',
        icon: '/png/lettuce.png',
    },
    {
        id: 'sauce',
        label: 'Sauces',
        icon: '/png/sauce.png',
    },
    {
        id: 'spice',
        label: 'Épices',
        icon: '/png/spice.png',
    },
] as CarouselItem[];

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
                {/* Title and price */}
                <CardHeader
                    title={
                        <Stack alignItems="center" direction="row" gap={1}>
                            {(ingredient.image) && (
                                <Image
                                    loader={imageLoader}
                                    src={ingredient.image}
                                    alt={''}
                                    height={36}
                                    width={36}
                                    className={'icon'}
                                />
                            )}
                            {ingredient.name}
                            {ingredient.acronym && (' ('+ingredient.acronym+')')}
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
                        </Stack>}
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

                {/* Chips */}
                {hasContents && (
                    <CardContent sx={{ py: 0 }}>
                        <Stack gap={1} alignItems={'flex-start'} direction="row">   
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
                        </Stack>
                    </CardContent>
                )}

                <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleOpenIngredientDialog}>
                        <EditOutlined
                            fontSize='small'
                            sx={(theme) => ({
                                color: theme.colors.main,
                            })} />
                    </IconButton>

                    <IconButton onClick={handleOpenDeleteDialog}>
                        <DeleteOutlined
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
        <>
            <Carousel carouselItems={ingredientCarouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
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
                mt={2}
                mb={4}
            >
                {ingredients.filter(p => p.category === ingredientCarouselItems[tabIndex].id).map((ingredient) =>
                    <Box key={ingredient.id} mb={'16px'}>
                        <IngredientItem ingredient={ingredient} setIngredientDialogOpen={setIngredientDialogOpen} setIngredient={setIngredient} />
                    </Box>
                )}
            </Stack>
        </>
    );
};

export default IngredientList;
