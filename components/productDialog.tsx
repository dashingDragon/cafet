import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, ListSubheader, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Product, productType } from '../lib/products';
import { useProductEditor, useProductMaker } from '../lib/firestoreHooks';
import { typeTranslation } from './productList';
import { Add, CheckBox, CheckBoxOutlineBlank, Clear } from '@mui/icons-material';
import { Ingredient } from '../lib/ingredients';
import { categoryTranslation } from './ingredientList';
import { formatMoney } from './accountDetails';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

interface IProductDialog extends DialogProps {
    setProductDialogOpen: (b: boolean) => void;
    ingredients: Ingredient[];
    product?: Product;
}

export const ProductDialog: React.FC<IProductDialog> = ({ open, setProductDialogOpen, ingredients, product }) => {
    const [type, setType] = useState<productType>('serving');
    const [name, setName] = useState('');
    const [isAvailable, setIsAvailable] = useState('true');
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);

    const [pendingSize, setPendingSize] = useState('');
    const [pendingPrice, setPendingPrice] = useState(0);

    useEffect(() => {
        if (product) {
            setType(product.type as productType);
            setName(product.name);
            setIsAvailable(product.isAvailable ? 'true' : 'false');
            if (product.sizeWithPrices) {
                setPrices(product.sizeWithPrices);
            }
            setImage(product.image);
            if (product.ingredients) {
                setSelectedIngredients(product.ingredients);
            }
            if (product.stock) {
                setStock(product.stock);
            }
        } else {
            setType('serving');
            setName('');
            setIsAvailable('true');
            setPrices({});
            setImage('');
            setSelectedIngredients([]);
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

    const handleChangePendingSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPendingSize(event.target.value);
    };


    const handleChangePendingPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parseInt(event.target.value)) {
            setPendingPrice(parseInt(event.target.value));
        }
    };

    const handleAddSizeWithPrice = () => {
        prices[pendingSize] = pendingPrice;
        setPrices({...prices});
        setPendingSize('');
        setPendingPrice(0);
    };

    const handleDeleteSize = (size: string) => {
        delete prices[size];
        setPrices({...prices});
    };

    const handleCreateProduct = async () => {
        await makeProduct(
            '0',
            type,
            name,
            isAvailable === 'true',
            image,
            prices,
            selectedIngredients,
            stock,
        );
        setType('serving');
        setName('');
        setIsAvailable('true');
        setPrices({});
        setSelectedIngredients([]);
        setStock(0);
        setPendingPrice(0);
        setPendingSize('');
        setImage('');
        setProductDialogOpen(false);
    };

    const handleEditProduct = async () => {
        if (product) {
            await editProduct(
                product,
                type,
                name,
                isAvailable === 'true',
                image,
                prices,
                selectedIngredients,
                stock,
            );
        }
        setType('serving');
        setName('');
        setIsAvailable('true');
        setPrices({});
        setSelectedIngredients([]);
        setStock(0);
        setPendingPrice(0);
        setPendingSize('');
        setImage('');
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
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <OutlinedInput
                            id="name-input"
                            placeholder='Nom'
                            value={name}
                            onChange={handleChangeName}
                        />
                    </FormControl>

                    {/* Image */}
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <OutlinedInput
                            id="image-input"
                            placeholder="Image"
                            value={image}
                            onChange={handleChangeImage}
                        />
                    </FormControl>

                    {/* Ingrédients */}
                    {type === 'serving' && (
                        <Autocomplete
                            value={selectedIngredients}
                            onChange={(_, newValue) => {
                                setSelectedIngredients(newValue);
                            }}
                            multiple
                            id="checkboxes-tags-demo"
                            options={ingredients.sort((a, b) => -b.category.localeCompare(a.category))}
                            disableCloseOnSelect
                            groupBy={(option) => option.category}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.name === value.name}
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={option.name}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                        onChange={() => {}}
                                    />
                                    {option.name}
                                    <Typography variant="body2" ml="auto">
                                        {option.price > 0 && formatMoney(option.price)}
                                    </Typography>
                                </li>
                            )}
                            renderGroup={(params) => (
                                <li key={params.key}>
                                    <ListSubheader>{categoryTranslation[params.group]}</ListSubheader>
                                    {params.children}
                                </li>
                            )}
                            sx={{ marginTop: 2, minWidth: 120 }}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Ingrédients" variant="outlined" />
                            )}
                        />
                    )}

                    {/* Size and price */}
                    <Stack direction="column" width={'100%'} mt={4}>
                        <Typography>
                            Tailles et prix :
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <OutlinedInput
                                id="size-input"
                                placeholder="Taille"
                                value={pendingSize}
                                onChange={handleChangePendingSize}
                            />
                        </FormControl>
                        <FormControl fullWidth sx={{ marginTop: 1 }}>
                            <OutlinedInput
                                id="price-input"
                                placeholder="Prix (en centimes)"
                                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                                value={pendingPrice}
                                onChange={handleChangePendingPrice}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            />
                        </FormControl>
                        <Button
                            onClick={handleAddSizeWithPrice}
                            endIcon={(
                                <Add />
                            )}
                            variant="contained"
                            sx={{
                                marginTop: 1,
                            }}
                        >
                            Add
                        </Button>
                    </Stack>

                    {prices && Object.entries(product?.sizeWithPrices ? product.sizeWithPrices : prices).map(([size, price], i) =>
                        <Box key={i} display="flex" flexDirection="row" alignItems="center" justifyContent={'space-between'} py={1}>
                            <Typography variant="body1">{size}</Typography>
                            <Typography variant="body2">{formatMoney(price)}</Typography>
                            <IconButton onClick={() => handleDeleteSize(size)}>
                                <Clear />
                            </IconButton>
                        </Box>
                    )}


                    {/* Stock */}
                    {type !== 'serving' && (
                        <FormControl fullWidth sx={{ marginTop: 3 }}>
                            <OutlinedInput
                                id="stock-input"
                                placeholder="Unités en stock"
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
                <Button onClick={() => setProductDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Annuler</Button>
                <Button onClick={product ? handleEditProduct : handleCreateProduct} variant="contained">Confirmer</Button>
            </DialogActions>
        </Dialog>
    );
};