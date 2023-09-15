import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, Dialog, DialogActions, DialogTitle, IconButton, List, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useProductDeleter } from '../../lib/firestoreHooks';
import { getIngredientPrice } from '../../lib/ingredients';
import { Product, productCarouselItems } from '../../lib/products';
import { formatMoney } from '../accountDetails';
import { imageLoader } from '../../pages/_app';
import Image from 'next/image';
import { Carousel } from '../carousel';
import { CarouselItem } from '../../lib/products';

const ProductItem: React.FC<{
    product: Product,
    setProductDialogOpen: (b: boolean) => void,
    setProduct: (p: Product) => void
}> = ({ product, setProductDialogOpen, setProduct }) => {
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
                        fontSize: '14px',
                        color: theme.colors.main,
                    },
                    '.MuiCardHeader-subheader': {
                        fontSize: '10px',
                        color: theme.palette.mode === 'light' ? 'hsla(145, 50%, 26%, 1)' : 'hsla(145, 28%, 63%, 1)',
                    },
                })}
            />

            <CardContent sx={{ pb: 0 }}>
                {/* Description */}
                {product.description !== undefined && (
                    <Typography variant="body1" mb="16px" fontSize="10px">
                        {product.description}
                    </Typography>
                )}

                {/* Chips */}
                <Stack gap={1} alignItems={'flex-start'}>
                    {product.allergen  && (
                        <Chip
                            variant='outlined'
                            color={'warning'}
                            label={product.allergen}
                            sx={{
                                fontSize: '8px',
                                fontWeight: 700,
                                height: '24px',
                            }}
                        />
                    )}
                    {product.isVegan ? (
                        <Chip
                            variant='outlined'
                            color={'success'}
                            label={'Végan'}
                            sx={{
                                fontSize: '8px',
                                fontWeight: 700,
                                height: '24px',
                            }}
                        />
                    ) : product.isVege && (
                        <Chip
                            variant='outlined'
                            color={'success'}
                            label={'Végé'}
                            sx={{
                                fontSize: '8px',
                                fontWeight: 700,
                                height: '24px',
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
                            fontSize: '8px',
                            fontWeight: 700,
                            height: '24px',
                        }}
                    />
                </Stack>
            </CardContent>
            <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
                {/* Edit button */}
                <IconButton onClick={handleOpenProductDialog}>
                    <EditOutlined
                        fontSize='small'
                        sx={(theme) => ({
                            color: theme.colors.main,
                        })} />
                </IconButton>

                {/* Delete button */}
                <IconButton onClick={handleOpenDeleteDialog}>
                    <DeleteOutlined
                        fontSize='small'
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
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <>
            <Carousel carouselItems={productCarouselItems} tabIndex={tabIndex} setTabIndex={setTabIndex} />
            <Stack
                direction={'row'}
                justifyContent={'flex-start'}
                sx={{
                    flexShrink: 0,
                    overflowX: 'auto',
                    marginRight: '-32px',
                    paddingRight: '32px',
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
                {products.filter(p => p.type === productCarouselItems[tabIndex].id).map((product) =>
                    <Box key={product.id} mb={'8px'}>
                        <ProductItem product={product} setProductDialogOpen={setProductDialogOpen} setProduct={setProduct} />
                    </Box>
                )}
            </Stack>
        </>
    );
};

export default ProductList;
