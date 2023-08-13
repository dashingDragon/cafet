import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, FilledInput, FormControl, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Product, productType } from '../lib/products';
import { useProductEditor, useProductMaker } from '../lib/firestoreHooks';
import { typeTranslation } from './productList';

interface IProductDialog extends DialogProps {
    setProductDialogOpen: (b: boolean) => void;
    product?: Product;
}

export const ProductDialog: React.FC<IProductDialog> = ({ open, setProductDialogOpen, product }) => {
    console.log(product);
    const [type, setType] = useState<productType>('serving');
    const [name, setName] = useState('');
    const [isAvailable, setIsAvailable] = useState('true');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState('');

    useEffect(() => {
        if (product) {
            setType(product.type as productType);
            setName(product.name);
            setIsAvailable(product.isAvailable ? 'true' : 'false');
            setPrice(product.price);
            setImage(product.image);
            if (product.description) {
                setDescription(product.description);
            }
            if (product.stock) {
                setStock(product.stock);
            }
        } else {
            setType('serving');
            setName('');
            setIsAvailable('true');
            setPrice(0);
            setImage('');
            setDescription('');
            setStock(0);
        }
    }, [product]);

    const makeProduct = useProductMaker();
    const editProduct = useProductEditor();

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

    const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImage(event.target.value);
    };

    const handleCreateProduct = async () => {
        const product: Product = {
            id: '0',
            type: type,
            name: name,
            description: description,
            isAvailable: isAvailable === 'true',
            image: image,
            price: price,
        };
        await makeProduct(product);
        setType('serving');
        setName('');
        setIsAvailable('true');
        setPrice(0);
        setStock(0);
        setDescription('');

        setProductDialogOpen(false);
    };

    const handleEditProduct = async () => {
        if (product) {
            if (type === 'serving') {
                await editProduct(
                    product,
                    type,
                    name,
                    isAvailable === 'true',
                    image,
                    price,
                    description,
                    undefined,
                );
            } else {
                await editProduct(
                    product,
                    type,
                    name,
                    isAvailable === 'true',
                    image,
                    price,
                    undefined,
                    stock,
                );
            }
        }
        setProductDialogOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setProductDialogOpen(false)}>
            <DialogTitle>
                {product ? `Modifier ${product.name}` : 'Ajouter un produit'}
            </DialogTitle>

            <DialogContent>
                <Stack direction={'column'} flexGrow={1}>

                    {/* Type */}
                    <InputLabel id="type-select-label">Type du produit :</InputLabel>
                    <Select
                        labelId="type-select-label"
                        value={type}
                        onChange={handleChangeType}
                    >
                        {Object.entries(typeTranslation).map(([k, v]) =>
                            <MenuItem key={k} value={k}>{v}</MenuItem>
                        )}
                    </Select>

                    {/* Name */}
                    <FormControl fullWidth sx={{ marginTop: 3 }}>
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

                    {/* Image */}
                    <FormControl fullWidth sx={{ marginTop: 3 }}>
                        <InputLabel>Image</InputLabel>
                        <FilledInput
                            id="image-input"
                            value={image}
                            onChange={handleChangeImage}
                        />
                    </FormControl>

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
                <Button onClick={() => setProductDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                <Button onClick={product ? handleEditProduct : handleCreateProduct} variant="contained">Confirmer</Button>
            </DialogActions>
        </Dialog>
    );
};