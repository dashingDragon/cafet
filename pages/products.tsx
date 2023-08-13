import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import ProductList from '../components/productList';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import { useIngredients, useProducts, useStaffUser } from '../lib/firestoreHooks';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useState } from 'react';
import PendingDialog from '../components/pendingDialog';
import IngredientList from '../components/ingredientList';
import { ProductDialog } from '../components/productDialog';
import { Product } from '../lib/products';
import IngredientDialog from '../components/ingredientDialog';
import { Ingredient } from '../lib/ingredients';

const ProductPage: NextPage = () => {
    useGuardIsConnected();
    const products = useProducts();
    const ingredients = useIngredients();
    const staff = useStaffUser();
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [product, setProduct] = useState<Product>();
    const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
    const [ingredient, setIngredient] = useState<Ingredient>();

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    {products === undefined
                        ? <LoadingScreen />
                        : <>
                            <FullHeightScrollableContainer sx={{ position: 'relative', pb: '128px' }}>
                                <>
                                    <ProductList
                                        products={products}
                                        setProductDialogOpen={setProductDialogOpen}
                                        setProduct={setProduct}
                                    />
                                    <IngredientList
                                        ingredients={ingredients}
                                        setIngredientDialogOpen={setIngredientDialogOpen}
                                        setIngredient={setIngredient}
                                    />
                                    {staff?.isAdmin &&
                                        <Fab
                                            onClick={() => { setProduct(undefined); setIngredient(undefined); setPendingDialogOpen(true);}}
                                            color="primary"
                                            sx={{
                                                position: 'fixed',
                                                bottom: 70,
                                                right: 50,
                                            }}>
                                            <Add />
                                        </Fab>
                                    }
                                </>
                            </FullHeightScrollableContainer>
                            {staff?.isAdmin && (
                                <>
                                    <PendingDialog
                                        open={pendingDialogOpen}
                                        onClose={() => setPendingDialogOpen(false)}
                                        setPendingProductDialogOpen={setProductDialogOpen}
                                        setPendingIngredientDialogOpen={setIngredientDialogOpen}
                                    />
                                    <ProductDialog
                                        open={productDialogOpen}
                                        setProductDialogOpen={setProductDialogOpen}
                                        product={product}
                                    />
                                    <IngredientDialog
                                        open={ingredientDialogOpen}
                                        setIngredientDialogOpen={setIngredientDialogOpen}
                                        ingredient={ingredient}
                                    />
                                </>
                            )}
                        </>
                    }

                </PageLayout>
            </main>
        </>
    );
};

export default ProductPage;
