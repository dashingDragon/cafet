import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogTitle, IconButton,  List, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useIngredientDeleter, useStaffUser } from '../lib/firestoreHooks';
import { Ingredient } from '../lib/ingredients';
import { formatMoney } from './accountDetails';
import Image from 'next/image';
import { imageLoader } from '../pages/_app';

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
    const staff = useStaffUser();
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
                                    src={'svg/leaf.png'}
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
                            fontSize: '16px',
                            color: theme.colors.main,
                        },
                        '.MuiCardHeader-subheader': {
                            fontSize: '12px',
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
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    mr: '16px',
                                }}
                            />
                        )}
                        {ingredient.isVegan ? (
                            <Chip
                                variant='outlined'
                                color={'success'}
                                label={'Végan'}
                                sx={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                }}
                            />
                        ) : ingredient.isVege && (
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
                    </CardContent>
                )}

                {staff?.isAdmin && (
                    <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
                        <IconButton>
                            <EditOutlined
                                onClick={handleOpenIngredientDialog}
                                sx={(theme) => ({
                                    color: theme.colors.main,
                                })} />
                        </IconButton>

                        <IconButton>
                            <DeleteOutlined
                                onClick={handleOpenDeleteDialog}
                                sx={(theme) => ({
                                    color: theme.colors.main,
                                })} />
                        </IconButton>
                    </CardActions>
                )}
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
    return (
        <Box m={'16px'}>
            {Object.keys(categoryTranslation).map((category) => (
                <React.Fragment key={category}>
                    <Card sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        my: '16px',
                        borderRadius: '20px',
                        overflow: 'visible',
                        px: '32px',
                        height: '40px',
                        background: theme => theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                            : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                    }}>
                        <Typography variant="h5">{categoryTranslation[category]}</Typography>
                    </Card>
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
                        {ingredients.filter(p => p.category === category).map((ingredient) =>
                            <Box key={ingredient.id} mb={'16px'}>
                                <IngredientItem ingredient={ingredient} setIngredientDialogOpen={setIngredientDialogOpen} setIngredient={setIngredient} />
                            </Box>
                        )}
                    </Stack>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default IngredientList;
