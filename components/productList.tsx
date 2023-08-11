import { DeleteOutlined, EditOutlined, ExpandMore } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FilledInput, FormControl, Grid, IconButton, InputAdornment, InputLabel, List, MenuItem, Select, Stack, Typography } from '@mui/material';
import { grey, red } from '@mui/material/colors';
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

    const isOutOfStock = product.stock === 0;

    const isReallyAvailable = product.isAvailable && !isOutOfStock;

    return (
        <>
            <Card variant={isReallyAvailable ? 'elevation' : 'outlined'}>
                <CardHeader
                    title={product.name}
                    subheader={formatMoney(product.price)}
                    sx={(theme) => ({
                        '.MuiCardHeader-title': {
                            color: theme.colors.main,
                        },
                    })}
                />
                <Box sx={{
                    ...(!isReallyAvailable && {
                        position: 'relative',
                        '::after': {
                            position: 'absolute',
                            content: '""',
                            display: 'block',
                            background: 'hsla(0, 0%, 0%, 0.5)',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '200px',
                        },
                    }),
                }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={`Image de ${product.name}`}
                        sx={{
                            position: 'relative',
                        }}

                    />
                </Box>

                <CardContent>
                    {product.description !== undefined && (
                        <Typography variant="body1">
                            {product.description}
                        </Typography>
                    )}

                    <Chip
                        variant='outlined'
                        color={product.stock
                            ? 'success'
                            : isOutOfStock
                                ? 'error'
                                : product.isAvailable
                                    ? 'success'
                                    : 'error'
                        }
                        label={product.stock ? (
                            `${product.stock} restant${product.stock > 1 && 's'}`
                        ) : isOutOfStock ? (
                            'Stock épuisé'
                        ) : product.isAvailable ? (
                            'Disponible'
                        ) : (
                            'Indisponible'
                        )}
                        sx={{
                            fontWeight: 700,
                            mt: '16px',
                        }}
                    />
                </CardContent>
                {staff?.isAdmin && (
                    <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
                        <IconButton>
                            <EditOutlined
                                onClick={handleOpenEditDialog}
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
        <Box m={'16px'} mb={'128px'}>
            {['serving', 'drink', 'snack'].map((type) => (
                <React.Fragment key={type}>
                    <Typography variant="h5">{typeTranslation[type]}</Typography>
                    <List>
                        {products.filter(p => p.type === type).map((product) =>
                            <Box key={product.id} mb={'16px'}>
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
