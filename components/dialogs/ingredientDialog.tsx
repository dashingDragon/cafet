import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, FilledInput, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useIngredientEditor, useIngredientMaker } from '../../lib/firestoreHooks';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { Ingredient, ingredientCategory } from '../../lib/ingredients';
import { ingredientCarouselItems } from '../lists/ingredientList';

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
    const [image, setImage] = useState('');
    const [acronym, setAcronym] = useState('');

    useEffect(() => {
        if (ingredient) {
            setCategory(ingredient.category);
            setName(ingredient.name);
            setIsVege(ingredient.isVege ? 'true' : 'false');
            setIsVegan(ingredient.isVegan ? 'true' : 'false');
            setPrice(ingredient.price);
            setAllergen(ingredient.allergen);
            if (ingredient.image) {
                setImage(ingredient.image);
            }
            setAcronym(ingredient.acronym);
        } else {
            setCategory('veggie');
            setName('');
            setIsVege('true');
            setIsVegan('true');
            setPrice(0);
            setAllergen('');
            setImage('');
            setAcronym('');
        }
    }, [ingredient]);

    const makeIngredient = useIngredientMaker();
    const editIngredient = useIngredientEditor();

    // TODO make a function to abstract these handling functions
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

    const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImage(event.target.value);
    };

    const handleChangeAcronym = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAcronym(event.target.value);
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
            image: image,
            acronym: acronym,
        };
        await makeIngredient(ingredient);
        setCategory('veggie');
        setName('');
        setIsVege('true');
        setIsVegan('true');
        setPrice(0);
        setAllergen('');
        setImage('');
        setAcronym('');

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
                image,
                acronym,
            );
        }
        setCategory('veggie');
        setName('');
        setIsVege('true');
        setIsVegan('true');
        setPrice(0);
        setAllergen('');
        setImage('');
        setAcronym('');
        
        setIngredientDialogOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={() => setIngredientDialogOpen(false)}>
                <DialogTitle>
                    {ingredient ? `Modifier ${ingredient.name}` : 'Ajouter un ingrédient'}
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
                            {ingredientCarouselItems.map((item) =>
                                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                            )}
                        </Select>

                        {/* Name */}
                        <FormControl sx={{ marginTop: 3, minWidth: 120 }}>
                            <OutlinedInput
                                id="name-input"
                                placeholder="Nom"
                                aria-describedby="my-helper-text"
                                value={name}
                                onChange={handleChangeName}
                            />
                        </FormControl>

                        {/* Acronym */}
                        <FormControl sx={{ marginTop: 3, minWidth: 120 }}>
                            <OutlinedInput
                                id="acronym-input"
                                placeholder="Acronym"
                                aria-describedby="my-helper-text"
                                value={acronym}
                                onChange={handleChangeAcronym}
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
                                id="allergen-input"
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

                        {/* Image */}
                        <FormControl fullWidth sx={{ marginTop: 3 }}>
                            <OutlinedInput
                                id="image-input"
                                placeholder="Image"
                                value={image}
                                onChange={handleChangeImage}
                            />
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setIngredientDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                    <Button onClick={ingredient ? handleEditIngredient : handleCreateIngredient} variant="contained">Confirmer</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IngredientDialog;
