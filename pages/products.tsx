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
import PendingProductDialog from '../components/pendingProductDialog';
import PendingDialog from '../components/pendingDialog';
import IngredientList from '../components/ingredientList';
import PendingIngredientDialog from '../components/pendingIngredientDialog';

const ProductPage: NextPage = () => {
    useGuardIsConnected();
    const products = useProducts();
    const ingredients = useIngredients();
    const staff = useStaffUser();
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
    const [pendingProductDialogOpen, setPendingProductDialogOpen] = useState(false);
    const [pendingIngredientDialogOpen, setPendingIngredientDialogOpen] = useState(false);

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
                                    <ProductList products={products} />
                                    <IngredientList ingredients={ingredients} />
                                    {staff?.isAdmin &&
                                        <Fab
                                            onClick={() => setPendingDialogOpen(true)}
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
                                        setPendingProductDialogOpen={setPendingProductDialogOpen}
                                        setPendingIngredientDialogOpen={setPendingIngredientDialogOpen}
                                    />
                                    <PendingProductDialog open={pendingProductDialogOpen} onClose={() => setPendingProductDialogOpen(false)} />
                                    <PendingIngredientDialog open={pendingIngredientDialogOpen} onClose={() => setPendingIngredientDialogOpen(false)} />
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
