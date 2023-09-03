import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import ProductList from '../components/lists/productList';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import { useIngredients, useProducts } from '../lib/firestoreHooks';
import { useGuardIsAdmin } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useState } from 'react';
import PendingDialog from '../components/dialogs/pendingDialog';
import IngredientList from '../components/lists/ingredientList';
import { ProductDialog } from '../components/dialogs/productDialog';
import { Product } from '../lib/products';
import IngredientDialog from '../components/dialogs/ingredientDialog';
import { Ingredient } from '../lib/ingredients';

const ProductListPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const products = useProducts();
    const ingredients = useIngredients();
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [product, setProduct] = useState<Product>();
    const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
    const [ingredient, setIngredient] = useState<Ingredient>();

    return (
        <>
            <Head>
                <title>Cafet</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout title={'Cafet'}>
                    <FullHeightScrollableContainer sx={{ position: 'relative', pb: '128px' }}>
                        {products === undefined || admin === undefined ? (
                            <LoadingScreen />
                        ) : (
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

                                <Fab
                                    onClick={() => { setProduct(undefined); setIngredient(undefined); setPendingDialogOpen(true);}}
                                    color="primary"
                                    sx={{
                                        position: 'fixed',
                                        bottom: 72,
                                        right: 16,
                                    }}
                                >
                                    <Add />
                                </Fab>

                                <PendingDialog
                                    open={pendingDialogOpen}
                                    onClose={() => setPendingDialogOpen(false)}
                                    setPendingProductDialogOpen={setProductDialogOpen}
                                    setPendingIngredientDialogOpen={setIngredientDialogOpen}
                                />
                                <ProductDialog
                                    open={productDialogOpen}
                                    setProductDialogOpen={setProductDialogOpen}
                                    ingredients={ingredients}
                                    product={product}
                                />
                                <IngredientDialog
                                    open={ingredientDialogOpen}
                                    setIngredientDialogOpen={setIngredientDialogOpen}
                                    ingredient={ingredient}
                                />
                            </>
                        )}
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default ProductListPage;
