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
                <title>Kafet</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    <FullHeightScrollableContainer sx={{ position: 'relative' }}>
                        {staffs === undefined || admin === undefined
                            ? <LoadingScreen />
                            : (
                                <>
                                    <Typography variant="h5" m={1}>Staffs</Typography>
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
