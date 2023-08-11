import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, FilledInput, FormControl, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { Product, productType } from '../lib/product';
import { useProductEditor } from '../lib/firestoreHooks';

interface EditProductProps extends DialogProps {
    product: Product;
    setEditDialogOpen: (b: boolean) => void;
}

export const EditProductDialog: React.FC<EditProductProps> = ({ product, open, setEditDialogOpen }) => {
    const [type, setType] = useState<productType>(product.type as productType);
    const [name, setName] = useState(product.name);
    const [imagePath, setImagePath] = useState(product.image ?? '');
    const [isAvailable, setIsAvailable] = useState(product.isAvailable ? 'true' : 'false');
    const [price, setPrice] = useState(product.price);
    const [description, setDescription] = useState(product.description);
    const [stock, setStock] = useState(0);

    const editor = useProductEditor();

    const handleChangeType = (event: SelectChangeEvent) => {
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

    const handleEditProduct = async () => {
        if (type === 'serving') {
            await editor(
                product,
                type,
                name,
                isAvailable === 'true',
                imagePath,
                price,
                description,
                undefined,
            );
        } else {
            await editor(
                product,
                type,
                name,
                isAvailable === 'true',
                imagePath,
                price,
                undefined,
                stock,
            );
        }

        setEditDialogOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>
                {`Modifier ${product.name}`}
            </DialogTitle>

            <DialogContent sx={{ width: 300 }}>
                <Stack direction={'column'} flexGrow={1}>
                    {/* Type */}
                    <InputLabel id="type-select-label">Sélectionnez le type du produit :</InputLabel>
                    <Select
                        labelId="type-select-label"
                        value={type}
                        onChange={handleChangeType}
                    >
                        <MenuItem value={'serving'}>Plat</MenuItem>
                        <MenuItem value={'drink'}>Boisson</MenuItem>
                        <MenuItem value={'snack'}>Snack</MenuItem>
                    </Select>

                    {/* Name */}
                    <FormControl  sx={{ marginTop: 3, minWidth: 120 }}>
                        <InputLabel>Nom</InputLabel>
                        <FilledInput
                            id="name-input"
                            value={name}
                            onChange={handleChangeName}
                        />
                    </FormControl>

                    {/* Description */}
                    {type === 'serving' && (
                        <TextField
                            id="description-input"
                            label="Description"
                            multiline
                            maxRows={4}
                            variant="filled"
                            value={description}
                            onChange={handleChangeDescription}
                            sx={{ marginTop: 3, minWidth: 120 }}
                        />
                    )}

                    {/* Price */}
                    <FormControl fullWidth sx={{ marginTop: 3 }} variant="filled">
                        <InputLabel htmlFor="price-input">Prix (en centimes)</InputLabel>
                        <FilledInput
                            id="price-input"
                            startAdornment={<InputAdornment position="start">€</InputAdornment>}
                            value={price}
                            onChange={handleChangePrice}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                    <InputLabel id="availability-input" sx={{ marginTop: 3 }}>Le produit est-il disponible ?</InputLabel>
                    <Select
                        labelId="availability-input"
                        value={isAvailable}
                        onChange={handleChangeAvailability}
                    >
                        <MenuItem value={'true'}>Oui</MenuItem>
                        <MenuItem value={'false'}>Non</MenuItem>
                    </Select>

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setEditDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                <Button onClick={handleEditProduct} variant="contained">Confirmer</Button>
            </DialogActions>
        </Dialog>
    );
};