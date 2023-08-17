import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogTitle, IconButton,  List, Typography } from '@mui/material';
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
            <Card variant={'elevation'}>
                <CardHeader
                    title={
                        <>
                            {ingredient.name}
                            {(ingredient.isVege || ingredient.isVegan) && (
                                <Image
                                    loader={imageLoader}
                                    src={'svg/leaf.png'}
                                    alt={'Vege'}
                                    height={36}
                                    width={36}
                                    className={'icon'}
                                />
                            )}


                        </>}
                    subheader={ingredient.price ? formatMoney(ingredient.price) : ''}
                    sx={(theme) => ({
                        '.MuiCardHeader-title': {
                            color: theme.colors.main,
                        },
                    })}
                />

                {hasContents && (
                    <CardContent>
                        {ingredient.allergen  && (
                            <Chip
                                variant='outlined'
                                color={'warning'}
                                label={ingredient.allergen}
                                sx={{
                                    fontWeight: 700,
                                    mt: '16px',
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
                                    fontWeight: 700,
                                    mt: '16px',
                                }}
                            />
                        ) : ingredient.isVege && (
                            <Chip
                                variant='outlined'
                                color={'success'}
                                label={'Végé'}
                                sx={{
                                    fontWeight: 700,
                                    mt: '16px',
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
                    <Typography variant="h5">{categoryTranslation[category]}</Typography>
                    <List>
                        {ingredients.filter(p => p.category === category).map((ingredient) =>
                            <Box key={ingredient.id} mb={'16px'}>
                                <IngredientItem ingredient={ingredient} setIngredientDialogOpen={setIngredientDialogOpen} setIngredient={setIngredient} />
                            </Box>
                        )}
                    </List>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default IngredientList;
