import { DeleteOutlined, EditOutlined, ExpandMore } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FilledInput, FormControl, Grid, IconButton, InputAdornment, InputLabel, List, MenuItem, Select, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useProductDeleter, useStaffUser } from '../lib/firestoreHooks';
import { Product } from '../lib/products';
import { formatMoney } from './accountDetails';

export const typeTranslation: Record<string, string> = { 'serving': 'Plat', 'drink': 'Boisson', 'snack': 'Snack'};

const ProductItem: React.FC<{
    product: Product,
    setProductDialogOpen: (b: boolean) => void,
    setProduct: (p: Product) => void
}> = ({ product, setProductDialogOpen, setProduct }) => {
    const staff = useStaffUser();
    const deleteProduct = useProductDeleter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteProduct = async () => {
        await deleteProduct(product);
        setDeleteDialogOpen(false);
    };

    const handleOpenDeleteDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleOpenProductDialog = (event: React.MouseEvent) => {
        event.stopPropagation();
        setProduct(product);
        setProductDialogOpen(true);
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
                    position: 'relative',
                    '::after': {
                        position: 'absolute',
                        content: '""',
                        display: 'block',
                        boxShadow: 'inset 0px 5px 5px 0px hsla(0,0%,0%,0.2), inset 0px -5px 5px 0px hsla(0,0%,0%,0.2)',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '200px',
                    },
                    ...(!isReallyAvailable && {
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
                        {/* Edit button */}
                        <IconButton>
                            <EditOutlined
                                onClick={handleOpenProductDialog}
                                sx={(theme) => ({
                                    color: theme.colors.main,
                                })} />
                        </IconButton>

                        {/* Delete button */}
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

            {/* Delete product dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>
                    {'Êtes-vous sûr de vouloir supprimer ce produit ?'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: theme => theme.colors.main }}>Non</Button>
                    <Button onClick={handleDeleteProduct} color="error" variant="contained" sx={{ color: 'white' }}>Oui</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const ProductList: React.FC<{
  products: Product[],
  setProductDialogOpen: (b: boolean) => void;
  setProduct: (p: Product) => void;
}> = ({ products, setProductDialogOpen, setProduct }) => {
    return (
        <Box m={'16px'}>
            {Object.keys(typeTranslation).map((type) => (
                <React.Fragment key={type}>
                    <Typography variant="h5">{typeTranslation[type]}</Typography>
                    <List>
                        {products.filter(p => p.type === type).map((product) =>
                            <Box key={product.id} mb={'16px'}>
                                <ProductItem product={product} setProductDialogOpen={setProductDialogOpen} setProduct={setProduct} />
                            </Box>
                        )}
                    </List>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default ProductList;
