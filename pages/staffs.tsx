import { Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import LoadingScreen from '../components/loading';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import StaffList from '../components/lists/staffList';
import { useStaffs } from '../lib/firestoreHooks';
import { useGuardIsAdmin } from '../lib/hooks';

const StaffPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const staffs = useStaffs();

    return (
        <>
            <Head>
                <title>Cafet</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout title={'Cafet'}>
                    <FullHeightScrollableContainer sx={{ position: 'relative' }}>
                        {staffs === undefined || admin === undefined
                            ? <LoadingScreen />
                            : (
                                <>
                                    <Typography variant="h5" mb={2}>Staffs</Typography>
                                    <StaffList staffs={staffs} />
                                </>
                            )
                        }
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default StaffPage;
