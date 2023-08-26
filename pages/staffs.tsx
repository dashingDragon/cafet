import { Add } from '@mui/icons-material';
import { Fab, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import LoadingScreen from '../components/loading';
import PageLayout from '../components/pageLayout';
import CustomerDialog from '../components/dialogs/customerDialog';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import StaffList from '../components/lists/staffList';
import { useStaffs } from '../lib/firestoreHooks';
import { useGuardIsAdmin } from '../lib/hooks';

const StaffPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const staffs = useStaffs();
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);

    return (
        <>
            <Head>
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    {staffs === undefined || admin === undefined
                        ? <LoadingScreen />
                        : <>
                            <FullHeightScrollableContainer sx={{ position: 'relative' }}>
                                <>
                                    <Typography variant="h5" m={1}>Staffs</Typography>
                                    <StaffList staffs={staffs} />
                                    <Fab
                                        onClick={() => setPendingDialogOpen(true)}
                                        color="primary"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 16,
                                            right: 16,
                                        }}>
                                        <Add />
                                    </Fab>
                                </>
                            </FullHeightScrollableContainer>

                            <CustomerDialog open={pendingDialogOpen} onClose={() => setPendingDialogOpen(false)} />
                        </>
                    }
                </PageLayout>
            </main>
        </>
    );
};

export default StaffPage;
