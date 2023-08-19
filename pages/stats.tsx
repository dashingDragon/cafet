import { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import Stats from '../components/stats';
import { useGuardIsAdmin } from '../lib/hooks';

const StatsPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    if (!admin) return <></>;
    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={`Statistiques`}>
                    <FullHeightScrollableContainer>
                        <Stats />
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default StatsPage;
