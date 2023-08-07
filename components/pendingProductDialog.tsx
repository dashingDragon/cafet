import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FilledInput, FormControl, FormHelperText, Input, InputAdornment, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, OutlinedInput, Select, Stack, TextField } from '@mui/material';
import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { useProductMaker, useProducts } from '../lib/firestoreHooks';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { Product, productType } from '../lib/product';

// TODO add errors when fields are empty
export const PendingProductDialog: React.FC<{
  open: boolean,
  onClose: () => void,
}> = ({ open, onClose }) => {
    const [type, setType] = useState<productType>('serving');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isAvailable, setIsAvailable] = useState('true');
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);

    const makeProduct = useProductMaker();

    const handleChange = (event: SelectChangeEvent) => {
        setType(event.target.value as productType);
    };

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    const handleChangePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parseInt(event.target.value)) {
            setPrice(parseInt(event.target.value));
        }
    };

    const handleChangeStock = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parseInt(event.target.value)) {
            setStock(parseInt(event.target.value));
        }
    };

    const handleChangeAvailability = (event: SelectChangeEvent) => {
        setIsAvailable(event.target.value);
    };

    const onCreate = async () => {
        const product: Product = {
            id: '0',
            type: type,
            name: name,
            description: '',
            isAvailable: isAvailable === 'true',
            image: '',
            price: price,
        };
        await makeProduct(product);
        setType('serving');
        setName('');
        setIsAvailable('true');
        setPrice(0);
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>
          Ajouter un produit
                </DialogTitle>
                <DialogContent sx={{ width: 300 }}>
                    <Stack direction={'column'} flexGrow={1}>

                        {/* Type */}
                        <InputLabel id="select-small-label">Sélectionnez le type du produit :</InputLabel>
                        <Select
                            labelId="select-small-label"
                            value={type}
                            onChange={handleChange}
                        >
                            <MenuItem value={'serving'}>Plat</MenuItem>
                            <MenuItem value={'drink'}>Boisson</MenuItem>
                            <MenuItem value={'snack'}>Snack</MenuItem>
                        </Select>

                        {/* Name */}
                        <FormControl sx={{ marginTop: 3, minWidth: 120 }}>
                            <InputLabel>Nom</InputLabel>
                            <FilledInput
                                id="my-input"
                                aria-describedby="my-helper-text"
                                value={name}
                                onChange={handleChangeName}
                            />
                        </FormControl>

                        {/* Description */}
                        <TextField
                            id="standard-multiline-flexible"
                            label="Description"
                            multiline
                            maxRows={4}
                            variant="filled"
                            value={description}
                            onChange={handleChangeDescription}
                            sx={{ marginTop: 3, minWidth: 120 }}
                        />

                        {/* Prix */}
                        <FormControl fullWidth sx={{ marginTop: 3 }} variant="filled">
                            <InputLabel htmlFor="filled-adornment-amount">Prix (en centimes)</InputLabel>
                            <FilledInput
                                id="filled-adornment-amount"
                                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                                value={price}
                                onChange={handleChangePrice}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                type="number"
                            />
                        </FormControl>

                        {/* Stock */}
                        {type !== 'serving' && (
                            <FormControl fullWidth sx={{ marginTop: 3 }} variant="filled">
                                <InputLabel htmlFor="stock-input">Unités en stock</InputLabel>
                                <FilledInput
                                    id="stock-input"
                                    value={stock}
                                    onChange={handleChangeStock}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    type="number"
                                />
                            </FormControl>
                        )}

                        {/* Availability */}
                        <InputLabel id="select-small-label-availability" sx={{ marginTop: 3 }}>Le produit est-il disponible ?</InputLabel>
                        <Select
                            labelId="select-small-label-availability"
                            value={isAvailable}
                            onChange={handleChangeAvailability}
                        >
                            <MenuItem value={'true'}>Oui</MenuItem>
                            <MenuItem value={'false'}>Non</MenuItem>
                        </Select>

                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Annuler</Button>
                    <Button onClick={onCreate} variant="contained">Ajouter</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PendingProductDialog;
