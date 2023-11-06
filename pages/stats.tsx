import { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/layout/pageLayout';
import FullHeightScrollableContainer from '../components/layout/scrollableContainer';
import Stats from '../components/stats';
import { useGuardIsAdmin } from '../lib/hooks';
import LoadingScreen from '../components/loading';

const StatsPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    if (!admin) return <></>;
    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout title={`Statistiques`}>
                    <FullHeightScrollableContainer>
                        {admin === undefined ? (
                            <LoadingScreen />
                        ) : (
                            <Stats />
                        )}
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default StatsPage;
