import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import ProductList from '../components/productList';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import { useProducts, useStaffUser } from '../lib/firestoreHooks';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import { useState } from 'react';
import PendingProductDialog from '../components/pendingProductDialog';

const ProductPage: NextPage = () => {
    useGuardIsConnected();
    const products = useProducts();
    const staff = useStaffUser();
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);

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
                            <FullHeightScrollableContainer sx={{ position: 'relative' }}>
                                <>
                                    <ProductList products={products} />
                                    {staff?.isAdmin &&
                                        <Fab
                                            onClick={() => setPendingDialogOpen(true)}
                                            color="primary"
                                            sx={(theme) => ({
                                                position: 'fixed',
                                                bottom: 70,
                                                right: 50,
                                            })}>
                                            <Add />
                                        </Fab>
                                    }
                                </>
                            </FullHeightScrollableContainer>
                            {staff?.isAdmin &&
                                <PendingProductDialog open={pendingDialogOpen} onClose={() => setPendingDialogOpen(false)} />
                            }
                        </>
                    }

                </PageLayout>
            </main>
        </>
    );
};

export default ProductPage;
