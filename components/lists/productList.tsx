import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, Dialog, DialogActions, DialogTitle, IconButton, List, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useProductDeleter, useStaffUser } from '../../lib/firestoreHooks';
import { Product } from '../../lib/products';
import { formatMoney } from '../accountDetails';
import { imageLoader } from '../../pages/_app';
import Image from 'next/image';
import { getIngredientPrice } from '../../lib/ingredients';

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
            width: 200,
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
                        height: '100px',
                    },
                }),
            }}>
                <CardMedia
                    component="img"
                    height="100"
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
                                src={'png/leaf.png'}
                                alt={'Vege'}
                                height={18}
                                width={18}
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
                    px: '16px',
                    pt: '8px',
                    pb: 0,
                    '.MuiCardHeader-title': {
                        fontSize: '16px',
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        fontSize: '12px',
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />

            <CardContent sx={{ pb: 0 }}>
                {product.description !== undefined && (
                    <Typography variant="body1" mb="16px" fontSize="10px">
                        {product.description}
                    </Typography>
                )}

                <Stack gap={1} alignItems={'flex-start'}>
                    {product.allergen  && (
                        <Chip
                            variant='outlined'
                            color={'warning'}
                            label={product.allergen}
                            sx={{
                                fontSize: '10px',
                                fontWeight: 700,
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
                                fontSize: '10px',
                                fontWeight: 700,
                                mr: '16px',
                            }}
                        />
                    ) : product.isVege && (
                        <Chip
                            variant='outlined'
                            color={'success'}
                            label={'Végé'}
                            sx={{
                                fontSize: '10px',
                                fontWeight: 700,
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
                            `${product.stock} ${product.stock > 1 ? 'restants' : 'restant'}`
                        ) : isOutOfStock ? (
                            'Stock épuisé'
                        ) : product.isAvailable ? (
                            'Disponible'
                        ) : (
                            'Indisponible'
                        )}
                        sx={{
                            fontSize: '10px',
                            fontWeight: 700,
                        }}
                    />
                </Stack>
            </CardContent>
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
        <Box mx={'16px'}>
            {Object.keys(typeTranslation).map((type) => (
                <React.Fragment key={type}>
                    <Card sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        my: '16px',
                        borderRadius: '20px',
                        overflow: 'visible',
                        px: '32px',
                        height: '40px',
                        background: theme => theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                            : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                    }}>
                        <Typography variant="h5" sx={{
                            color: theme => theme.palette.mode === 'light' ? 'hsla(326, 100%, 20%, 1)' : 'hsla(326, 100%, 90%, 1)',
                        }}>{typeTranslation[type]}</Typography>
                    </Card>

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
                        gap={2}
                    >
                        {products.filter(p => p.type === type).map((product) =>
                            <Box key={product.id} mb={'8px'}>
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
