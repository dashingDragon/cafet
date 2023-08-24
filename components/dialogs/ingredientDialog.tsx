import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, FilledInput, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useIngredientEditor, useIngredientMaker } from '../../lib/firestoreHooks';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { Ingredient, ingredientCategory } from '../../lib/ingredients';
import { categoryTranslation } from '../lists/ingredientList';

interface IIngredientDialog extends DialogProps {
    setIngredientDialogOpen: (b: boolean) => void;
    ingredient?: Ingredient;
}

// TODO add errors when fields are empty
export const IngredientDialog: React.FC<IIngredientDialog> = ({ open, setIngredientDialogOpen, ingredient }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<ingredientCategory>('veggie');
    const [isVege, setIsVege] = useState('false');
    const [isVegan, setIsVegan] = useState('false');
    const [price, setPrice] = useState(0);
    const [allergen, setAllergen] = useState('');

    useEffect(() => {
        if (ingredient) {
            setCategory(ingredient.category);
            setName(ingredient.name);
            setIsVege(ingredient.isVege ? 'true' : 'false');
            setIsVegan(ingredient.isVegan ? 'true' : 'false');
            setPrice(ingredient.price);
            setAllergen(ingredient.allergen);
        } else {
            setCategory('veggie');
            setName('');
            setIsVege('true');
            setIsVegan('true');
            setPrice(0);
            setAllergen('');
        }
    }, [ingredient]);

    const makeIngredient = useIngredientMaker();
    const editIngredient = useIngredientEditor();

    const handleChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as ingredientCategory);
    };

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleChangeVege = (event: SelectChangeEvent) => {
        setIsVege(event.target.value);
    };

    const handleChangeVegan = (event: SelectChangeEvent) => {
        setIsVegan(event.target.value);
    };

    const handleChangePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(parseInt(event.target.value));
    };

    const handleChangeAllergen = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAllergen(event.target.value);
    };

    const handleCreateIngredient = async () => {
        const ingredient: Ingredient = {
            id: '0',
            name: name,
            category: category,
            isVege: isVege === 'true',
            isVegan: isVegan === 'true',
            price: price,
            allergen: allergen,
        };
        await makeIngredient(ingredient);
        setName('');
        setCategory('veggie');
        setIsVege('false');
        setIsVegan('false');
        setPrice(0);
        setAllergen('');

        setIngredientDialogOpen(false);
    };

    const handleEditIngredient = async () => {
        if (ingredient) {
            await editIngredient(
                ingredient,
                name,
                category,
                isVege === 'true',
                isVegan === 'true',
                price,
                allergen,
            );
        }
        setIngredientDialogOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={() => setIngredientDialogOpen(false)}>
                <DialogTitle>
                    Ajouter un ingrédient
                </DialogTitle>

                <DialogContent>
                    <Stack direction={'column'} flexGrow={1}>

                        {/* Category */}
                        <InputLabel id="select-small-label">Catégorie de l&apos;ingrédient :</InputLabel>
                        <Select
                            labelId="select-small-label"
                            value={category}
                            onChange={handleChange}
                        >
                            {Object.entries(categoryTranslation).map(([k, v]) =>
                                <MenuItem key={k} value={k}>{v}</MenuItem>
                            )}
                        </Select>

                        {/* Name */}
                        <FormControl sx={{ marginTop: 3, minWidth: 120 }}>
                            <OutlinedInput
                                id="my-input"
                                placeholder="Nom"
                                aria-describedby="my-helper-text"
                                value={name}
                                onChange={handleChangeName}
                            />
                        </FormControl>

                        {/* Vege */}
                        <InputLabel id="select-small-label-vege" sx={{ marginTop: 3 }}>Le produit est-il végé ?</InputLabel>
                        <Select
                            labelId="select-small-label-vege"
                            value={isVege}
                            onChange={handleChangeVege}
                        >
                            <MenuItem value={'true'}>Oui</MenuItem>
                            <MenuItem value={'false'}>Non</MenuItem>
                        </Select>

                        {/* Vegan */}
                        <InputLabel id="select-small-label-availability" sx={{ marginTop: 3 }}>Le produit est-il vegan ?</InputLabel>
                        <Select
                            labelId="select-small-label-availability"
                            value={isVegan}
                            onChange={handleChangeVegan}
                        >
                            <MenuItem value={'true'}>Oui</MenuItem>
                            <MenuItem value={'false'}>Non</MenuItem>
                        </Select>

                        {/* Allergen */}
                        <FormControl sx={{ marginTop: 3, minWidth: 120 }}>
                            <OutlinedInput
                                id="my-input"
                                placeholder="Allergène"
                                aria-describedby="my-helper-text"
                                value={allergen}
                                onChange={handleChangeAllergen}
                            />
                        </FormControl>

                        {/* Prix */}
                        <FormControl fullWidth sx={{ marginTop: 3 }} variant="filled">
                            <OutlinedInput
                                id="filled-adornment-amount"
                                placeholder="Prix (en centimes)"
                                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                                value={price}
                                onChange={handleChangePrice}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                type="number"
                            />
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setIngredientDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={ingredient ? handleEditIngredient : handleCreateIngredient} variant="contained">Ajouter</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IngredientDialog;
