import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FilledInput, FormControl, Grid, IconButton, InputAdornment, InputLabel, List, MenuItem, Select, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useState } from 'react';
import { useProductDeleter, useSetProductAvailability, useStaffUser } from '../lib/firestoreHooks';
import { Product } from '../lib/product';
import { formatMoney } from './accountDetails';
import { EditProductDialog } from './editProductDialog';

export const typeTranslation: Record<string, string> = { 'serving': 'Plat', 'drink': 'Boisson', 'snack': 'Snack'};

const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
    const staff = useStaffUser();
    const setProductAvailability = useSetProductAvailability();
    const deleteProduct = useProductDeleter();
    const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleChangeAvailability = async (shouldBeAvailable: boolean) => {
        setAvailabilityDialogOpen(false);
        if (product.isAvailable !== shouldBeAvailable) {
            await setProductAvailability(product, !product.isAvailable);
        }
    };

    const handleDeleteProduct = async () => {
        await deleteProduct(product);
        setDeleteDialogOpen(false);
    };

    const handleOpenDeleteDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleOpenEditDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setEditDialogOpen(true);
    };

    return (
        <>
            <Button
                variant="contained"
                fullWidth
                sx={(theme) => ({
                    cursor: 'initial',
                    textTransform: 'none',
                    background: product.isAvailable
                        ? (theme.palette.mode === 'light' ? 'hsl(207, 90%, 80%)' : '#282828')
                        : 'transparent',
                    '&:hover': {
                        ...(!product.isAvailable && {
                            background: (theme.palette.mode === 'light' ? 'hsl(207, 90%, 80%)' : '#282828'),
                        }),
                    },
                })}
                disableRipple
            >
                <Box display="flex" alignItems="stretch" width="100%">
                    {product.image !== undefined
                        ? <Avatar src={product.image} sx={{
                            mr: 1,
                            ...(!product.isAvailable && {
                                '&:before': {
                                    position: 'absolute',
                                    content: '\'\'',
                                    display: 'block',
                                    background: 'hsla(0, 0%, 0%, 0.5)',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '40px',
                                },
                            }),
                        }} />
                        : <Avatar sx={{ mr: 1 }}>{product.name[0]}</Avatar>
                    }
                    <Box display="flex" flexDirection="column" sx={{ textAlign: 'start', flexGrow: 1 }}>
                        <Grid container width={'100%'}>
                            {/* Name */}
                            <Grid item xs={4}>
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={(theme) => ({
                                        opacity: product.isAvailable ? 1 : 0.8,
                                        color: theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300],
                                    })}
                                >
                                    {product.name}
                                </Typography>
                            </Grid>

                            {/* Price */}
                            <Grid item xs={'auto'}>
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={(theme) => ({
                                        opacity: product.isAvailable ? 1 : 0.8,
                                        color: theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300],
                                    })}
                                >
                                    {formatMoney(product.price)}
                                </Typography>
                            </Grid>

                            {staff?.isAdmin && (
                            // Edit and Delete
                                <Grid container item xs justifyContent={'flex-end'}>
                                    <IconButton sx={{
                                        marginLeft: 'auto',
                                    }}>
                                        <EditOutlined
                                            onClick={handleOpenEditDialog}
                                            sx={(theme) => ({
                                                color: theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300],
                                            })} />
                                    </IconButton>

                                    <IconButton onClick={handleOpenDeleteDialog}>
                                        <DeleteOutlined sx={(theme) => ({
                                            color: theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300],
                                        })} />
                                    </IconButton>
                                </Grid>
                            )}
                        </Grid>

                        {product.type !== 'serving' && (
                            // Stock
                            <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={(theme) => ({
                                    color: product.stock
                                        ? theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300]
                                        : theme.palette.mode === 'light' ? 'hsla(357, 100%, 50%, 1)' : 'hsla(350, 67%, 56%, 1)',
                                })}
                            >
                                {product.stock ? `${product.stock} restant${product.stock > 1 && 's'} en stock` : 'Stock épuisé'}
                            </Typography>
                        )}

                        {!product.isAvailable && (
                            // Availability
                            <Typography variant="body1" sx={(theme) => ({
                                color: theme.palette.mode === 'light' ? 'hsla(357, 100%, 50%, 1)' : 'hsla(350, 67%, 56%, 1)',
                            })}>
                                Indisponible
                            </Typography>
                        )}

                        {/* Description */}
                        <Typography variant="body1" sx={(theme) => ({
                            color: theme.palette.mode === 'light' ? 'hsla(207, 100%, 12%, 1)' : grey[300],
                        })}>
                            {(!product.description || product.description === '') && product.type === 'serving' ? 'Ce produit n\'a pas de description.' : product.description}
                        </Typography>
                    </Box>
                </Box>
            </Button>

            {/* Change availability dialog */}
            <Dialog open={availabilityDialogOpen} onClose={() => setAvailabilityDialogOpen(false)}>
                <DialogTitle>
                    {'Le produit est-il disponible ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => handleChangeAvailability(false)}>Non</Button>
                    <Button onClick={() => handleChangeAvailability(true)}>Oui</Button>
                </DialogActions>
            </Dialog>

            {/* Delete product dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>
                    {'Êtes-vous sûr de vouloir supprimer ce produit ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Non</Button>
                    <Button onClick={handleDeleteProduct} color="error" variant="contained">Oui</Button>
                </DialogActions>
            </Dialog>

            {/* Edit product dialog */}
            <EditProductDialog open={editDialogOpen} setEditDialogOpen={setEditDialogOpen} product={product} />
        </>
    );
};

const ProductList: React.FC<{
  products: Product[],
}> = ({ products }) => {
    return (
        <Box m={1} mb={'100px'}>
            {['serving', 'drink', 'snack'].map((type) => (
                <React.Fragment key={type}>
                    <Typography variant="h5">{typeTranslation[type]}</Typography>
                    <List>
                        {products.filter(p => p.type === type).map((product) =>
                            <Box key={product.id} mb={1}>
                                <ProductItem product={product} />
                            </Box>
                        )}
                    </List>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default ProductList;
