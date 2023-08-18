import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, Dialog, DialogActions, DialogTitle, IconButton, List, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useProductDeleter, useStaffUser } from '../lib/firestoreHooks';
import { Product } from '../lib/products';
import { formatMoney } from './accountDetails';
import { imageLoader } from '../pages/_app';
import Image from 'next/image';
import { getIngredientPrice } from '../lib/ingredients';

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
        <Card variant={isReallyAvailable ? 'elevation' : 'outlined'} sx={{
            width: 350,
            position: 'relative',
            borderRadius: '20px',
        }}>
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
            <CardHeader
                title={
                    <>
                        {product.name}
                        {(product.isVege || product.isVegan) && product.type === 'serving' && (
                            <Image
                                loader={imageLoader}
                                src={'svg/leaf.png'}
                                alt={'Vege'}
                                height={36}
                                width={36}
                                className={'icon'}
                            />
                        )}
                    </>
                }
                subheader={
                    product.sizeWithPrices
                        ? Object.entries(product.sizeWithPrices)
                            .map(([size, price], i) => (
                                <span key={size}>
                                    {size}: <strong>
                                        {formatMoney(price + getIngredientPrice(product.ingredients))} {i < Object.entries(product.sizeWithPrices).length - 1 && ' · '}
                                    </strong>
                                </span>
                            ))
                        : ''
                }
                sx={(theme) => ({
                    px: '24px',
                    pt: '8px',
                    '.MuiCardHeader-title': {
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />

            <CardContent>
                {product.description !== undefined && (
                    <Typography variant="body1">
                        {product.description}
                    </Typography>
                )}

                {product.allergen  && (
                    <Chip
                        variant='outlined'
                        color={'warning'}
                        label={product.allergen}
                        sx={{
                            fontWeight: 700,
                            mt: '16px',
                            mr: '16px',
                        }}
                    />
                )}
                {product.isVegan ? (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végan'}
                        sx={{
                            fontWeight: 700,
                            mt: '16px',
                            mr: '16px',
                        }}
                    />
                ) : product.isVege && (
                    <Chip
                        variant='outlined'
                        color={'success'}
                        label={'Végé'}
                        sx={{
                            fontWeight: 700,
                            mt: '16px',
                            mr: '16px',
                        }}
                    />
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
        </Card>
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
                    <Typography variant="h5" mb={2}>{typeTranslation[type]}</Typography>
                    <Stack
                        direction={'row'}
                        justifyContent={'flex-start'}
                        sx={{
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            '&-ms-overflow-style:': {
                                display: 'none',
                            },
                        }}
                        gap={4}
                        mb={5}
                    >
                        {products.filter(p => p.type === type).map((product) =>
                            <Box key={product.id} mb={'16px'}>
                                <ProductItem product={product} setProductDialogOpen={setProductDialogOpen} setProduct={setProduct} />
                            </Box>
                        )}
                    </Stack>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default ProductList;
